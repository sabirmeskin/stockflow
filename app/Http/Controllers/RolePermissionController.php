<?php

namespace App\Http\Controllers;

use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RolePermissionController extends Controller
{
    public function index()
    {
        Gate::authorize('manage_users');

        $roles = Role::with('permissions')->get()->map(function ($role) {
            return [
                'id' => $role->id,
                'name' => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ];
        });

        $permissions = Permission::all()->pluck('name');

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage_users');

        $request->validate([
            'name' => 'required|string|max:50|unique:roles,name|alpha_dash',
        ]);

        $roleName = strtolower(trim($request->name));

        $role = Role::create(['name' => $roleName]);

        AuditLogger::log('CREATE_ROLE', "Création du rôle {$roleName}");

        return redirect()->back()->with('success', "Le rôle {$roleName} a été créé avec succès.");
    }

    public function update(Request $request, Role $role)
    {
        Gate::authorize('manage_users');

        if ($role->name === 'admin') {
            return redirect()->back()->withErrors(['error' => 'Le rôle Administrateur doit conserver toutes les permissions pour des raisons de sécurité.']);
        }

        $request->validate([
            'permissions' => 'array',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($request->permissions);

        AuditLogger::log('UPDATE_ROLE_PERMISSIONS', "Mise à jour des permissions pour le rôle {$role->name}");

        return redirect()->back()->with('success', "Les permissions du rôle {$role->name} ont été mises à jour.");
    }

    public function destroy(Role $role)
    {
        Gate::authorize('manage_users');

        if (in_array($role->name, ['admin', 'operator', 'consultant'])) {
            return redirect()->back()->withErrors(['error' => 'Les rôles système par défaut ne peuvent pas être supprimés.']);
        }

        $name = $role->name;
        $role->delete();

        AuditLogger::log('DELETE_ROLE', "Suppression du rôle {$name}");

        return redirect()->back()->with('success', "Le rôle {$name} a été supprimé avec succès.");
    }
}
