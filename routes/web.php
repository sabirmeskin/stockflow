<?php

use App\Http\Controllers\AuditLogController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\StockMovementController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\WarehouseController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Users CRUD (Admin only)
    Route::resource('users', UserController::class);
    Route::post('users/{user}/toggle-status', [UserController::class, 'toggleStatus'])->name('users.toggle-status');

    // Roles & Permissions CRUD (Admin only)
    Route::resource('roles', RolePermissionController::class)->only(['index', 'store', 'update', 'destroy']);

    // Warehouses CRUD
    Route::resource('warehouses', WarehouseController::class);

    // Items CRUD & Stock Alert thresholds
    Route::resource('items', ItemController::class);
    Route::post('items/{item}/alerts', [ItemController::class, 'updateAlerts'])->name('items.alerts.update');

    // Stock Movements
    Route::get('validations', [StockMovementController::class, 'pendingIndex'])->name('movements.pending');
    Route::get('movements', [StockMovementController::class, 'index'])->name('movements.index');
    Route::post('movements', [StockMovementController::class, 'store'])->name('movements.store');
    Route::post('movements/{movement}/validate', [StockMovementController::class, 'validateMovement'])->name('movements.validate');
    Route::post('movements/{movement}/reject', [StockMovementController::class, 'rejectMovement'])->name('movements.reject');

    // System Settings (Admin only)
    Route::get('settings/system', [SettingController::class, 'index'])->name('settings.system.index');
    Route::post('settings/system', [SettingController::class, 'store'])->name('settings.system.store');

    // Audit Logs (Admin only)
    Route::get('audit-logs', [AuditLogController::class, 'index'])->name('audit-logs.index');

    // Exports
    Route::get('reports/stock/excel', [ReportController::class, 'exportStockExcel'])->name('reports.stock.excel');
    Route::get('reports/stock/pdf', [ReportController::class, 'exportStockPdf'])->name('reports.stock.pdf');
    Route::get('reports/movement/excel', [ReportController::class, 'exportMovementExcel'])->name('reports.movement.excel');
    Route::get('reports/movement/pdf', [ReportController::class, 'exportMovementPdf'])->name('reports.movement.pdf');

    // Notifications API
    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/mark-read', [NotificationController::class, 'markAllRead'])->name('notifications.mark-all-read');
    Route::post('notifications/{id}/mark-read', [NotificationController::class, 'markRead'])->name('notifications.mark-read');
});

require __DIR__.'/settings.php';
