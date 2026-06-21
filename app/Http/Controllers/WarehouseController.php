<?php

namespace App\Http\Controllers;

use App\Models\Warehouse;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class WarehouseController extends Controller
{
    public function index()
    {
        Gate::authorize('read_warehouses');

        $warehouses = Warehouse::with('stocks.item')->get()->map(function ($warehouse) {
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
            'name' => 'required|string|max:255|unique:warehouses,name,' . $warehouse->id,
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
