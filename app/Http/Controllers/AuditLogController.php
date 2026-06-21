<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index()
    {
        Gate::authorize('read_audit_logs');

        $logs = AuditLog::with('user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'user_name' => $log->user ? $log->user->name : 'Système',
                    'user_email' => $log->user ? $log->user->email : 'N/A',
                    'action' => $log->action,
                    'description' => $log->description,
                    'ip_address' => $log->ip_address,
                    'created_at' => $log->created_at,
                ];
            });

        return Inertia::render('audit/index', [
            'logs' => $logs,
        ]);
    }
}
