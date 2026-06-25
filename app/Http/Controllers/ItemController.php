<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Stock;
use App\Models\Warehouse;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ItemController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('read_items');

        $driver = \DB::connection()->getDriverName();
        $likeOperator = $driver === 'sqlite' ? 'like' : 'ilike';

        $query = Item::query();

        // 1. Filter by Search Query (SKU or Name)
        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search, $likeOperator) {
                $q->where('name', $likeOperator, '%'.$search.'%')
                    ->orWhere('sku', $likeOperator, '%'.$search.'%');
            });
        }

        // 2. Filter by Category
        if ($request->has('category') && $request->category !== 'ALL') {
            $query->where('category', $request->category);
        }

        // 3. Filter by Alert Status
        if ($request->has('alert') && $request->alert !== 'ALL') {
            $alert = $request->alert;
            if ($alert === 'LOW') {
                $query->whereExists(function ($q) {
                    $q->select(\DB::raw(1))
                        ->from('stocks')
                        ->whereColumn('stocks.item_id', 'items.id')
                        ->whereRaw('stocks.quantity <= COALESCE(stocks.min_stock_override, items.min_stock)');
                });
            } elseif ($alert === 'OK') {
                $query->whereNotExists(function ($q) {
                    $q->select(\DB::raw(1))
                        ->from('stocks')
                        ->whereColumn('stocks.item_id', 'items.id')
                        ->whereRaw('stocks.quantity <= COALESCE(stocks.min_stock_override, items.min_stock)');
                });
            }
        }

        // 4. Paginate items
        $items = $query->with('stocks.warehouse')
            ->orderBy('sku', 'asc')
            ->paginate(10)
            ->withQueryString();

        $items->through(function ($item) {
            $totalStock = $item->stocks->sum('quantity');

            $isLowStock = false;
            $alertWarehouses = [];

            foreach ($item->stocks as $stock) {
                $threshold = $stock->min_stock_override !== null ? $stock->min_stock_override : $item->min_stock;
                if ($stock->quantity <= $threshold) {
                    $isLowStock = true;
                    $alertWarehouses[] = $stock->warehouse->name;
                }
            }

            return [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'price' => $item->price,
                'min_stock' => $item->min_stock,
                'total_stock' => $totalStock,
                'is_low_stock' => $isLowStock,
                'alert_warehouses' => $alertWarehouses,
                'stocks' => $item->stocks->map(function ($stock) {
                    return [
                        'warehouse_id' => $stock->warehouse_id,
                        'warehouse_name' => $stock->warehouse->name,
                        'quantity' => $stock->quantity,
                        'min_stock_override' => $stock->min_stock_override,
                    ];
                }),
            ];
        });

        // Get unique categories for dropdown (based on all items, not just current page)
        $categories = Item::distinct()->pluck('category')->toArray();

        $warehouses = Warehouse::all(['id', 'name']);

        return Inertia::render('items/index', [
            'items' => $items,
            'categories' => $categories,
            'warehouses' => $warehouses,
            'canManage' => auth()->user()->can('manage_items'),
            'canManageAlerts' => auth()->user()->can('manage_alerts'),
            'filters' => [
                'search' => $request->search ?? '',
                'category' => $request->category ?? 'ALL',
                'alert' => $request->alert ?? 'ALL',
            ],
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage_items');

        $request->validate([
            'sku' => 'required|string|unique:items|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
        ]);

        $item = Item::create($request->only('sku', 'name', 'description', 'category', 'price', 'min_stock'));

        AuditLogger::log('CREATE_ITEM', "Création de l'article {$item->sku} ({$item->name})");

        return redirect()->back()->with('success', 'Article créé avec succès.');
    }

    public function update(Request $request, Item $item)
    {
        Gate::authorize('manage_items');

        $request->validate([
            'sku' => 'required|string|unique:items,sku,'.$item->id.'|max:50',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:100',
            'price' => 'required|numeric|min:0',
            'min_stock' => 'required|integer|min:0',
        ]);

        $item->update($request->only('sku', 'name', 'description', 'category', 'price', 'min_stock'));

        AuditLogger::log('UPDATE_ITEM', "Modification de l'article {$item->sku}");

        return redirect()->back()->with('success', 'Article mis à jour avec succès.');
    }

    public function destroy(Item $item)
    {
        Gate::authorize('manage_items');

        $sku = $item->sku;
        $item->delete();

        AuditLogger::log('DELETE_ITEM', "Suppression de l'article {$sku}");

        return redirect()->back()->with('success', 'Article supprimé avec succès.');
    }

    public function updateAlerts(Request $request, Item $item)
    {
        Gate::authorize('manage_alerts');

        $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'min_stock_override' => 'nullable|integer|min:0',
            'quantity' => 'nullable|integer|min:0',
        ]);

        $stock = Stock::updateOrCreate(
            ['warehouse_id' => $request->warehouse_id, 'item_id' => $item->id],
            [
                'min_stock_override' => $request->min_stock_override,
            ]
        );

        if ($request->has('quantity') && $request->quantity !== null) {
            $stock->update(['quantity' => $request->quantity]);
        }

        AuditLogger::log('UPDATE_STOCK_ALERTS', "Configuration des alertes/stocks pour l'article {$item->sku} dans l'entrepôt ID {$request->warehouse_id}");

        return redirect()->back()->with('success', 'Seuil d\'alerte mis à jour avec succès.');
    }
}
