<?php

namespace App\Http\Controllers;

use App\Models\Item;
use App\Models\Stock;
use App\Models\StockMovement;
use App\Models\Warehouse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        Gate::authorize('view_dashboard');

        $totalWarehouses = Warehouse::count();
        $totalItems = Item::count();

        $totalStockValue = 0;
        $stocks = Stock::with('item')->get();
        foreach ($stocks as $stock) {
            $totalStockValue += $stock->quantity * ($stock->item ? $stock->item->price : 0);
        }

        $pendingMovementsCount = StockMovement::where('status', 'pending')->count();

        $activeAlertsCount = 0;
        $lowStockList = [];

        foreach ($stocks as $stock) {
            $item = $stock->item;
            if (! $item) {
                continue;
            }

            $threshold = $stock->min_stock_override !== null ? $stock->min_stock_override : $item->min_stock;
            if ($stock->quantity <= $threshold) {
                $activeAlertsCount++;
                $lowStockList[] = [
                    'item_name' => $item->name,
                    'sku' => $item->sku,
                    'warehouse_name' => $stock->warehouse ? $stock->warehouse->name : 'N/A',
                    'quantity' => $stock->quantity,
                    'threshold' => $threshold,
                ];
            }
        }

        $warehousesOccupancy = Warehouse::with('stocks')->get()->map(function ($w) {
            $currentStock = $w->stocks->sum('quantity');
            $rate = $w->capacity > 0 ? round(($currentStock / $w->capacity) * 100, 2) : 0;

            return [
                'name' => $w->name,
                'current_stock' => $currentStock,
                'capacity' => $w->capacity,
                'occupancy_rate' => $rate,
            ];
        });

        $recentMovements = StockMovement::with(['item', 'sourceWarehouse', 'destinationWarehouse', 'creator'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($mov) {
                return [
                    'id' => $mov->id,
                    'type' => $mov->type,
                    'item_name' => $mov->item ? $mov->item->name : 'N/A',
                    'sku' => $mov->item ? $mov->item->sku : 'N/A',
                    'source_name' => $mov->sourceWarehouse ? $mov->sourceWarehouse->name : 'N/A',
                    'dest_name' => $mov->destinationWarehouse ? $mov->destinationWarehouse->name : 'N/A',
                    'quantity' => $mov->quantity,
                    'status' => $mov->status,
                    'created_at' => $mov->created_at->diffForHumans(),
                ];
            });

        $movementsStats = [
            'IN' => StockMovement::where('type', 'IN')->where('status', 'validated')->count(),
            'OUT' => StockMovement::where('type', 'OUT')->where('status', 'validated')->count(),
            'TRANSFER' => StockMovement::where('type', 'TRANSFER')->where('status', 'validated')->count(),
        ];

        $categoryStats = [];
        $items = Item::with('stocks')->get();
        foreach ($items as $item) {
            $cat = $item->category ?: 'Autre';
            if (! isset($categoryStats[$cat])) {
                $categoryStats[$cat] = 0;
            }
            $categoryStats[$cat] += $item->stocks->sum('quantity');
        }

        return Inertia::render('dashboard', [
            'stats' => [
                'total_warehouses' => $totalWarehouses,
                'total_items' => $totalItems,
                'total_stock_value' => round($totalStockValue, 2),
                'pending_movements' => $pendingMovementsCount,
                'active_alerts' => $activeAlertsCount,
            ],
            'warehouses_occupancy' => $warehousesOccupancy,
            'recent_movements' => $recentMovements,
            'low_stock_list' => array_slice($lowStockList, 0, 5),
            'movements_stats' => $movementsStats,
            'category_stats' => $categoryStats,
        ]);
    }
}
