<?php

namespace App\Http\Controllers;

use App\Events\FaibleStockEvent;
use App\Events\MouvementCreatedEvent;
use App\Events\MouvementRejectedEvent;
use App\Events\MouvementValidatedEvent;
use App\Events\RuptureStockEvent;
use App\Models\Item;
use App\Models\User;
use App\Models\Warehouse;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Notifications\StockNotification;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class StockMovementController extends Controller
{
    public function index()
    {
        // Access is authenticated only
        $movements = StockMovement::with(['item', 'sourceWarehouse', 'destinationWarehouse', 'creator', 'validator'])
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        $movements->through(function ($mov) {
            return [
                'id' => $mov->id,
                'type' => $mov->type,
                'item' => $mov->item,
                'source_warehouse' => $mov->sourceWarehouse,
                'destination_warehouse' => $mov->destinationWarehouse,
                'quantity' => $mov->quantity,
                'creator' => $mov->creator,
                'validator' => $mov->validator,
                'status' => $mov->status,
                'rejection_reason' => $mov->rejection_reason,
                'created_at' => $mov->created_at,
            ];
        });

        $warehouses = Warehouse::all(['id', 'name']);
        $items = Item::with('stocks')->get();

        return Inertia::render('movements/index', [
            'movements' => $movements,
            'warehouses' => $warehouses,
            'items' => $items,
            'canCreate' => auth()->user()->can('manage_movements'),
        ]);
    }

    public function pendingIndex()
    {
        Gate::authorize('validate_movements');

        $movements = StockMovement::with(['item', 'sourceWarehouse', 'destinationWarehouse', 'creator'])
            ->where('status', 'pending')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($mov) {
                return [
                    'id' => $mov->id,
                    'type' => $mov->type,
                    'item' => $mov->item,
                    'source_warehouse' => $mov->sourceWarehouse,
                    'destination_warehouse' => $mov->destinationWarehouse,
                    'quantity' => $mov->quantity,
                    'creator' => $mov->creator,
                    'status' => $mov->status,
                    'created_at' => $mov->created_at,
                ];
            });

        return Inertia::render('movements/pending', [
            'movements' => $movements,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage_movements');

        $request->validate([
            'type' => 'required|in:IN,OUT,TRANSFER',
            'item_id' => 'required|exists:items,id',
            'quantity' => 'required|integer|min:1',
            'source_warehouse_id' => 'required_if:type,OUT,TRANSFER|nullable|exists:warehouses,id',
            'destination_warehouse_id' => 'required_if:type,IN,TRANSFER|nullable|exists:warehouses,id',
        ]);

        $type = $request->type;
        $itemId = $request->item_id;
        $qty = $request->quantity;
        $sourceId = $request->source_warehouse_id;
        $destId = $request->destination_warehouse_id;

        if ($type === 'OUT' || $type === 'TRANSFER') {
            $stock = Stock::where('warehouse_id', $sourceId)->where('item_id', $itemId)->first();
            if (!$stock || $stock->quantity < $qty) {
                return redirect()->back()->withErrors(['quantity' => 'Stock insuffisant dans l\'entrepôt source. Quantité disponible : ' . ($stock ? $stock->quantity : 0)]);
            }
        }

        $isAdmin = auth()->user()->hasRole('admin');
        $status = $isAdmin ? 'validated' : 'pending';

        $movement = StockMovement::create([
            'type' => $type,
            'item_id' => $itemId,
            'source_warehouse_id' => $sourceId,
            'destination_warehouse_id' => $destId,
            'quantity' => $qty,
            'created_by' => auth()->id(),
            'validated_by' => $isAdmin ? auth()->id() : null,
            'status' => $status,
        ]);

        if ($isAdmin) {
            $this->applyStockChange($movement);
            AuditLogger::log('CREATE_MOVEMENT_AUTO', "Mouvement {$type} auto-validé par l'admin pour l'article ID {$itemId} (Quantité: {$qty})");
        } else {
            AuditLogger::log('CREATE_MOVEMENT_PENDING', "Mouvement {$type} soumis pour validation par l'opérateur pour l'article ID {$itemId} (Quantité: {$qty})");

            // Notify admins about new pending movement
            $movement->load(['item', 'creator']);
            $adminIds = User::role('admin')->pluck('id')->toArray();

            event(new MouvementCreatedEvent($movement, $adminIds));

            $admins = User::role('admin')->get();
            Notification::send($admins, new StockNotification(
                'mouvement_created',
                'Nouveau mouvement',
                "Mouvement {$type} de {$qty} unités créé par {$movement->creator->name}",
                ['movement_id' => $movement->id, 'item_name' => $movement->item->name],
            ));
        }

        return redirect()->back()->with('success', $isAdmin ? 'Mouvement effectué et validé.' : 'Mouvement soumis à la validation de l\'administrateur.');
    }

    public function validateMovement(Request $request, StockMovement $movement)
    {
        Gate::authorize('validate_movements');

        if ($movement->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'Ce mouvement a déjà été traité.']);
        }

        if ($movement->type === 'OUT' || $movement->type === 'TRANSFER') {
            $stock = Stock::where('warehouse_id', $movement->source_warehouse_id)->where('item_id', $movement->item_id)->first();
            if (!$stock || $stock->quantity < $movement->quantity) {
                $movement->update([
                    'status' => 'rejected',
                    'validated_by' => auth()->id(),
                    'rejection_reason' => 'Rejeté automatiquement lors de la validation : stock insuffisant.',
                ]);
                AuditLogger::log('REJECT_MOVEMENT_AUTO', "Mouvement ID {$movement->id} rejeté automatiquement (stock insuffisant)");

                // Notify the operator about auto-rejection
                $movement->load(['item']);
                event(new MouvementRejectedEvent($movement));
                $creator = User::find($movement->created_by);
                if ($creator) {
                    $creator->notify(new StockNotification(
                        'mouvement_rejected',
                        'Mouvement rejeté',
                        "Votre mouvement {$movement->type} de {$movement->quantity} unités pour {$movement->item->name} a été rejeté — stock insuffisant",
                        ['movement_id' => $movement->id],
                    ));
                }

                return redirect()->back()->withErrors(['error' => 'Stock insuffisant. Le mouvement a été automatiquement rejeté.']);
            }
        }

        $movement->update([
            'status' => 'validated',
            'validated_by' => auth()->id(),
        ]);

        $this->applyStockChange($movement);

        AuditLogger::log('VALIDATE_MOVEMENT', "Validation du mouvement ID {$movement->id} par l'admin");

        // Notify the operator who created the movement
        $movement->load(['item']);
        event(new MouvementValidatedEvent($movement));
        $creator = User::find($movement->created_by);
        if ($creator) {
            $creator->notify(new StockNotification(
                'mouvement_validated',
                'Mouvement validé',
                "Votre mouvement {$movement->type} de {$movement->quantity} unités pour {$movement->item->name} a été validé",
                ['movement_id' => $movement->id],
            ));
        }

        return redirect()->back()->with('success', 'Mouvement validé et appliqué au stock.');
    }

    public function rejectMovement(Request $request, StockMovement $movement)
    {
        Gate::authorize('validate_movements');

        if ($movement->status !== 'pending') {
            return redirect()->back()->withErrors(['error' => 'Ce mouvement a déjà été traité.']);
        }

        $request->validate([
            'rejection_reason' => 'required|string|max:255',
        ]);

        $movement->update([
            'status' => 'rejected',
            'validated_by' => auth()->id(),
            'rejection_reason' => $request->rejection_reason,
        ]);

        AuditLogger::log('REJECT_MOVEMENT', "Mouvement ID {$movement->id} rejeté par l'admin. Raison : {$request->rejection_reason}");

        // Notify the operator who created the movement
        $movement->load(['item']);
        event(new MouvementRejectedEvent($movement));
        $creator = User::find($movement->created_by);
        if ($creator) {
            $creator->notify(new StockNotification(
                'mouvement_rejected',
                'Mouvement rejeté',
                "Votre mouvement {$movement->type} de {$movement->quantity} unités pour {$movement->item->name} a été rejeté — Raison : {$request->rejection_reason}",
                ['movement_id' => $movement->id, 'rejection_reason' => $request->rejection_reason],
            ));
        }

        return redirect()->back()->with('success', 'Mouvement rejeté.');
    }

    private function applyStockChange(StockMovement $movement)
    {
        $itemId = $movement->item_id;
        $qty = $movement->quantity;

        if ($movement->type === 'IN') {
            $stock = Stock::firstOrCreate(
                ['warehouse_id' => $movement->destination_warehouse_id, 'item_id' => $itemId],
                ['quantity' => 0]
            );
            $stock->increment('quantity', $qty);
        } elseif ($movement->type === 'OUT') {
            $stock = Stock::where('warehouse_id', $movement->source_warehouse_id)->where('item_id', $itemId)->first();
            if ($stock) {
                $stock->decrement('quantity', $qty);
                $this->checkStockAlerts($stock);
            }
        } elseif ($movement->type === 'TRANSFER') {
            $sourceStock = Stock::where('warehouse_id', $movement->source_warehouse_id)->where('item_id', $itemId)->first();
            if ($sourceStock) {
                $sourceStock->decrement('quantity', $qty);
                $this->checkStockAlerts($sourceStock);
            }
            $destStock = Stock::firstOrCreate(
                ['warehouse_id' => $movement->destination_warehouse_id, 'item_id' => $itemId],
                ['quantity' => 0]
            );
            $destStock->increment('quantity', $qty);
        }
    }

    /**
     * Check stock levels after a change and dispatch alerts if needed.
     */
    private function checkStockAlerts(Stock $stock): void
    {
        $stock->refresh();
        $item = $stock->item;
        $warehouse = $stock->warehouse;

        if (!$item || !$warehouse) {
            return;
        }

        $threshold = $stock->min_stock_override !== null ? $stock->min_stock_override : $item->min_stock;

        // Get all users (admins + operators) to notify for stock alerts
        $allUserIds = User::whereHas('roles')->pluck('id')->toArray();

        if ($stock->quantity <= 0) {
            // Rupture de stock — quantity is zero
            event(new RuptureStockEvent($item, $warehouse, $allUserIds));

            $allUsers = User::whereIn('id', $allUserIds)->get();
            Notification::send($allUsers, new StockNotification(
                'rupture_stock',
                'Rupture de stock',
                "L'article {$item->name} ({$item->sku}) est en rupture de stock dans {$warehouse->name}",
                ['item_name' => $item->name, 'sku' => $item->sku, 'warehouse_name' => $warehouse->name],
            ));
        } elseif ($stock->quantity <= $threshold) {
            // Faible stock — below threshold but still has some
            event(new FaibleStockEvent($item, $warehouse, $stock->quantity, $threshold, $allUserIds));

            $allUsers = User::whereIn('id', $allUserIds)->get();
            Notification::send($allUsers, new StockNotification(
                'faible_stock',
                'Stock faible',
                "L'article {$item->name} ({$item->sku}) est sous le seuil dans {$warehouse->name} ({$stock->quantity}/{$threshold})",
                ['item_name' => $item->name, 'sku' => $item->sku, 'warehouse_name' => $warehouse->name, 'quantity' => $stock->quantity, 'threshold' => $threshold],
            ));
        }
    }
}
