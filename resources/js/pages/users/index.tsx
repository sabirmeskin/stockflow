import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    User, 
    Mail, 
    ShieldCheck, 
    Lock,
    Search,
    UserX,
    UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useEffect } from 'react';

interface UserAccount {
    id: number;
    name: string;
    email: string;
    is_active: boolean;
    roles: string[];
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedUsers {
    data: UserAccount[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface Props {
    users: PaginatedUsers;
    roles: string[];
    filters: {
        search: string;
    };
    auth: {
        user: {
            id: number;
        };
    };
}

export default function UsersIndex({ users, roles, filters, auth }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserAccount | null>(null);

    const form = useForm({
        name: '',
        email: '',
        password: '',
        role: 'operator',
    });

    // Debounced search
    useEffect(() => {
        if (search === (filters.search || '')) return;

        const timer = setTimeout(() => {
            router.get('/users', {
                search: search,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const filteredUsers = users.data;

    const handleAddOpen = () => {
        form.reset();
        setIsAddOpen(true);
    };

    const handleEditOpen = (user: UserAccount) => {
        setSelectedUser(user);
        form.setData({
            name: user.name,
            email: user.email,
            password: '', // optional on edit
            role: user.roles[0] || 'operator',
        });
        setIsEditOpen(true);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        form.post('/users', {
            onSuccess: () => {
                setIsAddOpen(false);
                form.reset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        form.put(`/users/${selectedUser.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                form.reset();
            }
        });
    };

    const handleDelete = (user: UserAccount) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.name}" ?`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const handleToggleStatus = (user: UserAccount) => {
        const actionStr = user.is_active ? 'désactiver' : 'activer';
        if (confirm(`Voulez-vous ${actionStr} le compte de "${user.name}" ?`)) {
            router.post(`/users/${user.id}/toggle-status`);
        }
    };

    const getRoleBadge = (roleNames: string[]) => {
        const role = roleNames[0] || 'N/A';
        if (role === 'admin') {
            return <Badge className="bg-indigo-100 text-indigo-800 border-0 dark:bg-indigo-950/30 dark:text-indigo-400">Administrateur</Badge>;
        } else if (role === 'operator') {
            return <Badge className="bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-950/30 dark:text-emerald-400">Opérateur Terrain</Badge>;
        } else {
            return <Badge className="bg-amber-100 text-amber-800 border-0 dark:bg-amber-950/30 dark:text-amber-400">Consultant</Badge>;
        }
    };

    return (
        <>
            <Head title="Gestion des comptes utilisateurs" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Utilisateurs & Rôles</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Configurez les profils d'accès des opérateurs terrain et des consultants logistiques.
                        </p>
                    </div>
                    <Button onClick={handleAddOpen} className="gap-2">
                        <Plus className="h-4 w-4" /> Nouvel utilisateur
                    </Button>
                </div>

                {/* Search / Filters Row */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input 
                        placeholder="Rechercher un utilisateur par nom ou email..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="pl-9"
                    />
                </div>

                {/* Users List Table */}
                <div className="rounded-xl border border-neutral-200/50 bg-white dark:border-neutral-800 dark:bg-neutral-900/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="p-4">Utilisateur</th>
                                    <th className="p-4">Email</th>
                                    <th className="p-4">Rôle</th>
                                    <th className="p-4">Statut</th>
                                    <th className="p-4">Date d'inscription</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                                            Aucun utilisateur trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(user => (
                                        <tr key={user.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/20 transition-colors">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center font-bold text-neutral-700 dark:text-neutral-300">
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <span className="font-medium">{user.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-neutral-600 dark:text-neutral-400">{user.email}</td>
                                            <td className="p-4">{getRoleBadge(user.roles)}</td>
                                            <td className="p-4">
                                                {user.is_active ? (
                                                    <Badge className="bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-950/30 dark:text-emerald-400">Actif</Badge>
                                                ) : (
                                                    <Badge className="bg-rose-100 text-rose-800 border-0 dark:bg-rose-950/30 dark:text-rose-400">Désactivé</Badge>
                                                )}
                                            </td>
                                            <td className="p-4 text-xs text-neutral-500">
                                                {new Date(user.created_at).toLocaleDateString('fr-FR')}
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex justify-end gap-1.5">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleToggleStatus(user)}
                                                        disabled={user.id === auth.user.id}
                                                        title={user.is_active ? "Désactiver le compte" : "Activer le compte"}
                                                        className={`h-8 w-8 ${user.is_active ? 'text-amber-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/10' : 'text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/10'}`}
                                                    >
                                                        {user.is_active ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5" />}
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleEditOpen(user)}
                                                        className="h-8 w-8"
                                                    >
                                                        <Edit2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => handleDelete(user)}
                                                        disabled={user.id === auth.user.id}
                                                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {users.last_page > 1 && (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Affichage de <span className="font-semibold text-neutral-700 dark:text-neutral-200">{users.from || 0}</span> à <span className="font-semibold text-neutral-700 dark:text-neutral-200">{users.to || 0}</span> sur <span className="font-semibold text-neutral-700 dark:text-neutral-200">{users.total}</span> utilisateurs
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                                {users.links.map((link, idx) => {
                                    let label = link.label;
                                    if (label.includes('Previous') || label.includes('Précédent') || label.includes('&laquo;')) {
                                        label = '← Précédent';
                                    } else if (label.includes('Next') || label.includes('Suivant') || label.includes('&raquo;')) {
                                        label = 'Suivant →';
                                    }

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => {
                                                if (link.url) {
                                                    router.get(link.url, {}, {
                                                        preserveState: true,
                                                    });
                                                }
                                            }}
                                            disabled={!link.url}
                                            className={`inline-flex items-center justify-center rounded-md text-xs font-medium h-8 px-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
                                                ${link.active
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm'
                                                }
                                                ${!link.url ? 'pointer-events-none opacity-50' : ''}
                                            `}
                                        >
                                            {label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Add Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer un compte</DialogTitle>
                            <DialogDescription>Ajoutez un nouvel utilisateur et assignez-lui un profil.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAdd} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="name">Nom complet</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        id="name" 
                                        value={form.data.name} 
                                        onChange={e => form.setData('name', e.target.value)} 
                                        className="pl-9"
                                        required 
                                    />
                                </div>
                                {form.errors.name && <p className="text-xs text-rose-500">{form.errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="email">Adresse email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        id="email" 
                                        type="email"
                                        value={form.data.email} 
                                        onChange={e => form.setData('email', e.target.value)} 
                                        className="pl-9"
                                        required 
                                    />
                                </div>
                                {form.errors.email && <p className="text-xs text-rose-500">{form.errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="password">Mot de passe</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        id="password" 
                                        type="password"
                                        value={form.data.password} 
                                        onChange={e => form.setData('password', e.target.value)} 
                                        className="pl-9"
                                        required 
                                    />
                                </div>
                                {form.errors.password && <p className="text-xs text-rose-500">{form.errors.password}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="role">Rôle / Accès</Label>
                                <Select 
                                    value={form.data.role} 
                                    onValueChange={val => form.setData('role', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                        <SelectItem value="operator">Opérateur Terrain</SelectItem>
                                        <SelectItem value="consultant">Consultant</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.role && <p className="text-xs text-rose-500">{form.errors.role}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={form.processing}>Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier le compte</DialogTitle>
                            <DialogDescription>Mettez à jour les informations du profil utilisateur.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-name">Nom complet</Label>
                                <Input 
                                    id="edit-name" 
                                    value={form.data.name} 
                                    onChange={e => form.setData('name', e.target.value)} 
                                    required 
                                />
                                {form.errors.name && <p className="text-xs text-rose-500">{form.errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-email">Adresse email</Label>
                                <Input 
                                    id="edit-email" 
                                    type="email"
                                    value={form.data.email} 
                                    onChange={e => form.setData('email', e.target.value)} 
                                    required 
                                />
                                {form.errors.email && <p className="text-xs text-rose-500">{form.errors.email}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-password">Mot de passe (laisser vide pour ne pas modifier)</Label>
                                <Input 
                                    id="edit-password" 
                                    type="password"
                                    value={form.data.password} 
                                    onChange={e => form.setData('password', e.target.value)} 
                                />
                                {form.errors.password && <p className="text-xs text-rose-500">{form.errors.password}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-role">Rôle / Accès</Label>
                                <Select 
                                    value={form.data.role} 
                                    onValueChange={val => form.setData('role', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="admin">Administrateur</SelectItem>
                                        <SelectItem value="operator">Opérateur Terrain</SelectItem>
                                        <SelectItem value="consultant">Consultant</SelectItem>
                                    </SelectContent>
                                </Select>
                                {form.errors.role && <p className="text-xs text-rose-500">{form.errors.role}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={form.processing}>Enregistrer les modifications</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}

UsersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Utilisateurs',
            href: '/users',
        },
    ],
};
