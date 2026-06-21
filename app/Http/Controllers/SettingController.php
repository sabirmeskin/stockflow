<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function index()
    {
        Gate::authorize('configure_system');

        $settings = [
            'company_name' => SystemSetting::get('company_name', 'StockFlow Logistics'),
            'company_address' => SystemSetting::get('company_address', ''),
            'company_phone' => SystemSetting::get('company_phone', ''),
            'company_email' => SystemSetting::get('company_email', ''),
            'currency' => SystemSetting::get('currency', 'MAD'),
        ];

        return Inertia::render('settings/system', [
            'settings' => $settings,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('configure_system');

        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_address' => 'nullable|string|max:255',
            'company_phone' => 'nullable|string|max:50',
            'company_email' => 'nullable|email|max:100',
            'currency' => 'required|string|max:10',
        ]);

        foreach ($request->only('company_name', 'company_address', 'company_phone', 'company_email', 'currency') as $key => $value) {
            SystemSetting::set($key, $value);
        }

        AuditLogger::log('UPDATE_SETTINGS', "Mise à jour des paramètres système");

        return redirect()->back()->with('success', 'Configuration mise à jour avec succès.');
    }
}
