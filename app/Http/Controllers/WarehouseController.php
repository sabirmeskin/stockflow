<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Warehouse;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        Gate::authorize('read_warehouses');

        $warehouses = Warehouse::with('stocks.item')
            ->paginate(9)
            ->withQueryString();

        $warehouses->through(function ($warehouse) {
            $currentStock = $warehouse->stocks->sum('quantity');
            $occupancyRate = $warehouse->capacity > 0 ? round(($currentStock / $warehouse->capacity) * 100, 2) : 0;

            return [
                'id' => $warehouse->id,
                'name' => $warehouse->name,
                'address' => $warehouse->address,
                'capacity' => $warehouse->capacity,
                'current_stock' => $currentStock,
                'occupancy_rate' => $occupancyRate,
            ];
        });

        return Inertia::render('warehouses/index', [
            'warehouses' => $warehouses,
            'canManage' => auth()->user()->can('manage_warehouses'),
        ]);
    }

    public function show(Warehouse $warehouse, Request $request)
    {
        Gate::authorize('read_warehouses');

        $driver = DB::connection()->getDriverName();
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

        // 3. Filter by Alert Status for this warehouse
        if ($request->has('alert') && $request->alert !== 'ALL') {
            $alert = $request->alert;
            if ($alert === 'LOW') {
                $query->where(function ($q) use ($warehouse) {
                    $q->whereExists(function ($sub) use ($warehouse) {
                        $sub->select(DB::raw(1))
                            ->from('stocks')
                            ->whereColumn('stocks.item_id', 'items.id')
                            ->where('stocks.warehouse_id', $warehouse->id)
                            ->whereRaw('stocks.quantity <= COALESCE(stocks.min_stock_override, items.min_stock)');
                    })->orWhereNotExists(function ($sub) use ($warehouse) {
                        $sub->select(DB::raw(1))
                            ->from('stocks')
                            ->whereColumn('stocks.item_id', 'items.id')
                            ->where('stocks.warehouse_id', $warehouse->id);
                    });
                });
            } elseif ($alert === 'OK') {
                $query->whereExists(function ($sub) use ($warehouse) {
                    $sub->select(DB::raw(1))
                        ->from('stocks')
                        ->whereColumn('stocks.item_id', 'items.id')
                        ->where('stocks.warehouse_id', $warehouse->id)
                        ->whereRaw('stocks.quantity > COALESCE(stocks.min_stock_override, items.min_stock)');
                });
            }
        }

        // 4. Paginate items
        $items = $query->with('stocks.warehouse')
            ->orderBy('sku', 'asc')
            ->paginate(10)
            ->withQueryString();

        $items->through(function ($item) use ($warehouse) {
            $localStock = $item->stocks->firstWhere('warehouse_id', $warehouse->id);
            $localQuantity = $localStock ? $localStock->quantity : 0;
            $localMinStockOverride = $localStock ? $localStock->min_stock_override : null;

            $threshold = $localMinStockOverride !== null ? $localMinStockOverride : $item->min_stock;
            $isLowStock = $localQuantity <= $threshold;

            return [
                'id' => $item->id,
                'sku' => $item->sku,
                'name' => $item->name,
                'description' => $item->description,
                'category' => $item->category,
                'price' => $item->price,
                'min_stock' => $item->min_stock,
                'warehouse_quantity' => $localQuantity,
                'warehouse_min_stock_override' => $localMinStockOverride,
                'is_low_stock' => $isLowStock,
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

        $categories = Item::distinct()->pluck('category')->toArray();

        // Calculate warehouse details
        $currentStock = $warehouse->stocks()->sum('quantity');
        $occupancyRate = $warehouse->capacity > 0 ? round(($currentStock / $warehouse->capacity) * 100, 2) : 0;

        $warehouseData = [
            'id' => $warehouse->id,
            'name' => $warehouse->name,
            'address' => $warehouse->address,
            'capacity' => $warehouse->capacity,
            'current_stock' => $currentStock,
            'occupancy_rate' => $occupancyRate,
        ];

        return Inertia::render('warehouses/show', [
            'warehouse' => $warehouseData,
            'items' => $items,
            'categories' => $categories,
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
        Gate::authorize('manage_warehouses');

        $request->validate([
            'name' => 'required|string|max:255|unique:warehouses',
            'address' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        $warehouse = Warehouse::create($request->only('name', 'address', 'capacity'));

        AuditLogger::log('CREATE_WAREHOUSE', "Création de l'entrepôt {$warehouse->name} (Capacité: {$warehouse->capacity})");

        return redirect()->back()->with('success', 'Entrepôt créé avec succès.');
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        Gate::authorize('manage_warehouses');

        $request->validate([
            'name' => 'required|string|max:255|unique:warehouses,name,'.$warehouse->id,
            'address' => 'nullable|string|max:255',
            'capacity' => 'required|integer|min:1',
        ]);

        $warehouse->update($request->only('name', 'address', 'capacity'));

        AuditLogger::log('UPDATE_WAREHOUSE', "Modification de l'entrepôt {$warehouse->name} (Capacité: {$warehouse->capacity})");

        return redirect()->back()->with('success', 'Entrepôt mis à jour avec succès.');
    }

    public function destroy(Warehouse $warehouse)
    {
        Gate::authorize('manage_warehouses');

        $name = $warehouse->name;
        $warehouse->delete();

        AuditLogger::log('DELETE_WAREHOUSE', "Suppression de l'entrepôt {$name}");

        return redirect()->back()->with('success', 'Entrepôt supprimé avec succès.');
    }
}
