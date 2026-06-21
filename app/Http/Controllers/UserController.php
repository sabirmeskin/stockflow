<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        Gate::authorize('manage_users');

        $users = User::with('roles')->get()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_active' => $user->is_active,
                'roles' => $user->getRoleNames(),
                'created_at' => $user->created_at,
            ];
        });

        $roles = Role::all()->pluck('name');

        return Inertia::render('users/index', [
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('manage_users');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'is_active' => true,
        ]);

        $user->assignRole($request->role);

        AuditLogger::log('CREATE_USER', "Création de l'utilisateur {$user->email} avec le rôle {$request->role}");

        return redirect()->back()->with('success', 'Utilisateur créé avec succès.');
    }

    public function update(Request $request, User $user)
    {
        Gate::authorize('manage_users');

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => 'nullable|string|min:8',
            'role' => 'required|string|exists:roles,name',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        if ($request->filled('password')) {
            $user->update([
                'password' => bcrypt($request->password),
            ]);
        }

        $user->syncRoles([$request->role]);

        AuditLogger::log('UPDATE_USER', "Modification de l'utilisateur {$user->email} (Rôle: {$request->role})");

        return redirect()->back()->with('success', 'Utilisateur mis à jour avec succès.');
    }

    public function destroy(User $user)
    {
        Gate::authorize('manage_users');

        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Vous ne pouvez pas supprimer votre propre compte.']);
        }

        $email = $user->email;
        $user->delete();

        AuditLogger::log('DELETE_USER', "Suppression de l'utilisateur {$email}");

        return redirect()->back()->with('success', 'Utilisateur supprimé avec succès.');
    }

    public function toggleStatus(User $user)
    {
        Gate::authorize('manage_users');

        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Vous ne pouvez pas activer ou désactiver votre propre compte.']);
        }

        $user->is_active = !$user->is_active;
        $user->save();

        $statusStr = $user->is_active ? 'activé' : 'désactivé';
        AuditLogger::log('TOGGLE_USER_STATUS', "Le compte de l'utilisateur {$user->email} a été {$statusStr}");

        return redirect()->back()->with('success', "Le compte de l'utilisateur a été {$statusStr} avec succès.");
    }
}
