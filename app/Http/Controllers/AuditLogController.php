<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('read_audit_logs');

        $driver = \DB::connection()->getDriverName();
        $likeOperator = $driver === 'sqlite' ? 'like' : 'ilike';

        $query = AuditLog::query()->with('user');

        if ($request->has('search') && ! empty($request->search)) {
            $search = $request->search;
            $query->where(function ($q) use ($search, $likeOperator) {
                $q->where('action', $likeOperator, '%'.$search.'%')
                    ->orWhere('description', $likeOperator, '%'.$search.'%')
                    ->orWhere('ip_address', $likeOperator, '%'.$search.'%')
                    ->orWhereHas('user', function ($uq) use ($search, $likeOperator) {
                        $uq->where('name', $likeOperator, '%'.$search.'%')
                            ->orWhere('email', $likeOperator, '%'.$search.'%');
                    });
            });
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate(15)
            ->withQueryString();

        $logs->through(function ($log) {
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
            'filters' => [
                'search' => $request->search ?? '',
            ],
        ]);
    }
}
