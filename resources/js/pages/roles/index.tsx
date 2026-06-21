import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Shield, 
    Plus, 
    Trash2, 
    Save, 
    Lock, 
    ShieldCheck, 
    Info,
    Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface RoleData {
    id: number;
    name: string;
    permissions: string[];
}

interface Props {
    roles: RoleData[];
    permissions: string[];
}

const PERMISSION_GROUPS: Record<string, Array<{ name: string; label: string; desc: string }>> = {
    "Utilisateurs & Sécurité": [
        { name: "manage_users", label: "Gérer les utilisateurs et les rôles", desc: "Créer, modifier, de/activer et supprimer les comptes" },
        { name: "read_audit_logs", label: "Consulter le journal d'audit", desc: "Accéder à l'historique complet des actions système" }
    ],
    "Entrepôts & Articles": [
        { name: "manage_warehouses", label: "Gérer les entrepôts", desc: "Créer, modifier et supprimer des entrepôts" },
        { name: "read_warehouses", label: "Consulter les entrepôts", desc: "Voir la liste et les capacités des entrepôts" },
        { name: "manage_items", label: "Gérer le catalogue d'articles", desc: "Ajouter, modifier et supprimer des articles" },
        { name: "read_items", label: "Consulter le catalogue d'articles", desc: "Voir la liste des articles et leurs fiches" }
    ],
    "Flux de Stock": [
        { name: "manage_movements", label: "Saisir des mouvements de stock", desc: "Initier des entrées, sorties et transferts (soumis à validation)" },
        { name: "validate_movements", label: "Approuver/Rejeter les mouvements", desc: "Valider ou refuser les mouvements initiés par les opérateurs" },
        { name: "manage_alerts", label: "Gérer les alertes de stock", desc: "Configurer les seuils minimaux de stock par entrepôt" },
        { name: "read_alerts", label: "Consulter les alertes", desc: "Voir la liste des articles en rupture ou sous le seuil d'alerte" }
    ],
    "Analyses & Système": [
        { name: "view_dashboard", label: "Accéder au tableau de bord", desc: "Consulter les indicateurs clés (KPIs) et taux de remplissage" },
        { name: "export_reports", label: "Exporter des rapports analytiques", desc: "Télécharger les inventaires et mouvements en PDF/Excel" },
        { name: "configure_system", label: "Configurer le système", desc: "Modifier les informations et réglages de l'entreprise" }
    ]
};

export default function RolesIndex({ roles, permissions }: Props) {
    const [selectedRole, setSelectedRole] = useState<RoleData>(roles[0] || null);
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

    const roleForm = useForm({
        name: '',
    });

    // Sync selected permissions when selected role changes
    useEffect(() => {
        if (selectedRole) {
            setSelectedPermissions(selectedRole.permissions);
        }
    }, [selectedRole]);

    // Keep selectedRole reference updated when roles prop updates
    useEffect(() => {
        if (selectedRole) {
            const updated = roles.find(r => r.id === selectedRole.id);
            if (updated) {
                setSelectedRole(updated);
            }
        }
    }, [roles]);

    const handleRoleSelect = (role: RoleData) => {
        setSelectedRole(role);
    };

    const handlePermissionToggle = (permName: string, checked: boolean) => {
        if (selectedRole.name === 'admin') return; // Cannot modify admin role

        if (checked) {
            setSelectedPermissions(prev => [...prev, permName]);
        } else {
            setSelectedPermissions(prev => prev.filter(p => p !== permName));
        }
    };

    const submitAddRole = (e: React.FormEvent) => {
        e.preventDefault();
        roleForm.post('/roles', {
            onSuccess: () => {
                setIsAddRoleOpen(false);
                roleForm.reset();
            }
        });
    };

    const savePermissions = () => {
        if (!selectedRole) return;
        
        router.put(`/roles/${selectedRole.id}`, {
            permissions: selectedPermissions
        });
    };

    const handleDeleteRole = (role: RoleData) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement le rôle "${role.name}" ?`)) {
            router.delete(`/roles/${role.id}`, {
                onSuccess: () => {
                    if (selectedRole.id === role.id) {
                        setSelectedRole(roles[0]);
                    }
                }
            });
        }
    };

    const getRoleDisplayName = (name: string) => {
        const mapping: Record<string, string> = {
            admin: 'Administrateur',
            operator: 'Opérateur Terrain',
            consultant: 'Consultant Logistique',
        };
        return mapping[name] || name.charAt(0).toUpperCase() + name.slice(1);
    };

    const isSystemRole = (name: string) => {
        return ['admin', 'operator', 'consultant'].includes(name);
    };

    return (
        <>
            <Head title="Rôles & Permissions" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Section */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ShieldCheck className="h-6 w-6 text-indigo-600" /> Rôles & Permissions
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Configurez les habilitations de sécurité pour chaque rôle d'utilisateur au sein de StockFlow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
                    
                    {/* Left Pane: Roles list */}
                    <Card className="md:col-span-1 border border-neutral-200/50 dark:border-neutral-800">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                            <div>
                                <CardTitle className="text-md font-bold">Rôles ({roles.length})</CardTitle>
                                <CardDescription>Liste des profils</CardDescription>
                            </div>
                            <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => setIsAddRoleOpen(true)}
                                className="h-8 w-8"
                                title="Créer un rôle"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-2 space-y-1">
                            {roles.map(role => {
                                const isSelected = selectedRole?.id === role.id;
                                return (
                                    <div 
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role)}
                                        className={`flex items-center justify-between p-2.5 rounded-lg text-sm cursor-pointer transition-all ${
                                            isSelected 
                                                ? 'bg-indigo-50/70 text-indigo-900 border-l-4 border-indigo-600 dark:bg-indigo-950/20 dark:text-indigo-400 font-medium' 
                                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/30 text-neutral-700 dark:text-neutral-300'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <Shield className={`h-4 w-4 shrink-0 ${isSelected ? 'text-indigo-600' : 'text-neutral-400'}`} />
                                            <span className="truncate">{getRoleDisplayName(role.name)}</span>
                                        </div>
                                        {!isSystemRole(role.name) && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteRole(role);
                                                }}
                                                className="h-6 w-6 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 opacity-70 hover:opacity-100"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                );
                            })}
                        </CardContent>
                    </Card>

                    {/* Right Pane: Selected Role Permissions */}
                    <div className="md:col-span-3 space-y-6">
                        {selectedRole ? (
                            <Card className="border border-neutral-200/50 dark:border-neutral-800">
                                <CardHeader className="pb-4 border-b border-neutral-100 dark:border-neutral-800/50 flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <span>Permissions de : {getRoleDisplayName(selectedRole.name)}</span>
                                            {isSystemRole(selectedRole.name) ? (
                                                <span className="text-[10px] bg-neutral-100 text-neutral-700 px-2 py-0.5 rounded-full font-semibold dark:bg-neutral-800 dark:text-neutral-400 border border-neutral-200/50 dark:border-neutral-700/50 flex items-center gap-1">
                                                    <Lock className="h-2.5 w-2.5" /> Rôle Système
                                                </span>
                                            ) : (
                                                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold dark:bg-blue-950/20 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                                                    Rôle Personnalisé
                                                </span>
                                            )}
                                        </CardTitle>
                                        <CardDescription>
                                            Cochez ou décochez les permissions associées à ce profil.
                                        </CardDescription>
                                    </div>
                                    {selectedRole.name !== 'admin' && (
                                        <Button onClick={savePermissions} className="gap-2 h-9">
                                            <Save className="h-4 w-4" /> Enregistrer les permissions
                                        </Button>
                                    )}
                                </CardHeader>
                                <CardContent className="pt-6 space-y-6">
                                    {selectedRole.name === 'admin' && (
                                        <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/50 rounded-xl p-4 flex gap-3 text-sm text-indigo-900 dark:text-indigo-400">
                                            <Info className="h-5 w-5 shrink-0 text-indigo-600" />
                                            <div>
                                                <p className="font-semibold">Permissions Administrateur protégées</p>
                                                <p className="text-xs mt-0.5 text-indigo-800/80 dark:text-indigo-400/80">
                                                    Le rôle Administrateur possède obligatoirement toutes les permissions de l'application pour garantir la pérennité du système.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Permissions List Organized in Groups */}
                                    <div className="space-y-6">
                                        {Object.entries(PERMISSION_GROUPS).map(([groupName, groupPerms]) => (
                                            <div key={groupName} className="space-y-3">
                                                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
                                                    {groupName}
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {groupPerms.map(perm => {
                                                        const isChecked = selectedRole.name === 'admin' || selectedPermissions.includes(perm.name);
                                                        return (
                                                            <div 
                                                                key={perm.name}
                                                                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
                                                                    isChecked
                                                                        ? 'bg-neutral-50/50 border-neutral-200/80 dark:bg-neutral-900/10 dark:border-neutral-800/50'
                                                                        : 'border-neutral-100 dark:border-neutral-900 bg-transparent'
                                                                }`}
                                                            >
                                                                <Checkbox 
                                                                    id={`perm-${perm.name}`}
                                                                    checked={isChecked}
                                                                    disabled={selectedRole.name === 'admin'}
                                                                    onCheckedChange={(checked) => handlePermissionToggle(perm.name, !!checked)}
                                                                    className="mt-0.5"
                                                                />
                                                                <div className="grid gap-0.5 leading-none">
                                                                    <Label 
                                                                        htmlFor={`perm-${perm.name}`}
                                                                        className="text-sm font-semibold cursor-pointer text-neutral-800 dark:text-neutral-200"
                                                                    >
                                                                        {perm.label}
                                                                    </Label>
                                                                    <span className="text-xs text-neutral-400 dark:text-neutral-500">
                                                                        {perm.desc}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center p-12 text-center text-neutral-500">
                                <Shield className="h-12 w-12 text-neutral-300" />
                                <span className="text-sm font-semibold mt-2">Aucun rôle sélectionné</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Role Dialog */}
                <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer un rôle personnalisé</DialogTitle>
                            <DialogDescription>
                                Définissez un nouveau groupe d'accès. Vous pourrez lui assigner des permissions une fois créé.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAddRole} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="role-name">Nom du rôle (ex: operateur_principal)</Label>
                                <Input 
                                    id="role-name" 
                                    placeholder="Utilisez des lettres et tirets uniquement"
                                    value={roleForm.data.name} 
                                    onChange={e => roleForm.setData('name', e.target.value)} 
                                    required 
                                />
                                {roleForm.errors.name && <p className="text-xs text-rose-500">{roleForm.errors.name}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddRoleOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={roleForm.processing}>Créer le rôle</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Utilisateurs',
            href: '/users',
        },
        {
            title: 'Rôles & Permissions',
            href: '/roles',
        },
    ],
};
