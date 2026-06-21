import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Warehouse as WarehouseIcon, 
    MapPin, 
    Plus, 
    Edit2, 
    Trash2, 
    ShieldAlert, 
    Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface WarehouseData {
    id: number;
    name: string;
    address: string | null;
    capacity: number;
    current_stock: number;
    occupancy_rate: number;
}

interface Props {
    warehouses: WarehouseData[];
    canManage: boolean;
}

export default function WarehousesIndex({ warehouses, canManage }: Props) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<WarehouseData | null>(null);

    const { 
        data, 
        setData, 
        post, 
        put, 
        delete: destroy, 
        processing, 
        errors, 
        reset 
    } = useForm({
        name: '',
        address: '',
        capacity: 1000,
    });

    const handleAddOpen = () => {
        reset();
        setIsAddOpen(true);
    };

    const handleEditOpen = (w: WarehouseData) => {
        setSelectedWarehouse(w);
        setData({
            name: w.name,
            address: w.address || '',
            capacity: w.capacity,
        });
        setIsEditOpen(true);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        post('/warehouses', {
            onSuccess: () => {
                setIsAddOpen(false);
                reset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedWarehouse) return;
        put(`/warehouses/${selectedWarehouse.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                reset();
            }
        });
    };

    const handleDelete = (w: WarehouseData) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'entrepôt "${w.name}" ?`)) {
            destroy(`/warehouses/${w.id}`);
        }
    };

    return (
        <>
            <Head title="Gestion des entrepôts" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Gestion des Entrepôts</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Consultez les capacités de stockage et configurez vos sites logistiques.
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={handleAddOpen} className="gap-2">
                            <Plus className="h-4 w-4" /> Nouvel entrepôt
                        </Button>
                    )}
                </div>

                {/* Warehouses Grid */}
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {warehouses.length === 0 ? (
                        <Card className="col-span-full border border-dashed border-neutral-300 dark:border-neutral-800 flex flex-col items-center justify-center p-12 text-center">
                            <WarehouseIcon className="h-12 w-12 text-neutral-400 mb-4" />
                            <h3 className="text-lg font-semibold">Aucun entrepôt disponible</h3>
                            <p className="text-sm text-neutral-500 mt-1 max-w-sm">
                                Veuillez ajouter votre premier entrepôt pour commencer à gérer vos stocks.
                            </p>
                            {canManage && (
                                <Button onClick={handleAddOpen} className="mt-4 gap-2">
                                    <Plus className="h-4 w-4" /> Créer un entrepôt
                                </Button>
                            )}
                        </Card>
                    ) : (
                        warehouses.map((w) => (
                            <Card key={w.id} className="border border-neutral-200/60 dark:border-neutral-800 flex flex-col justify-between">
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <CardTitle className="text-lg font-bold flex items-center gap-2">
                                                <WarehouseIcon className="h-5 w-5 text-blue-500 shrink-0" />
                                                {w.name}
                                            </CardTitle>
                                            <CardDescription className="flex items-center gap-1 text-xs">
                                                <MapPin className="h-3 w-3 shrink-0 text-neutral-400" />
                                                {w.address || 'Adresse non spécifiée'}
                                            </CardDescription>
                                        </div>
                                        {canManage && (
                                            <div className="flex gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleEditOpen(w)}
                                                    className="h-8 w-8"
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(w)}
                                                    className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 pb-4">
                                    {/* Capacity Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs font-semibold">
                                            <span className="text-neutral-500">Capacité utilisée</span>
                                            <span>{w.current_stock} / {w.capacity} U ({w.occupancy_rate}%)</span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                                            <div 
                                                className={`h-2 rounded-full transition-all duration-500 ${
                                                    w.occupancy_rate > 90 
                                                        ? 'bg-rose-500' 
                                                        : w.occupancy_rate > 70 
                                                            ? 'bg-amber-500' 
                                                            : 'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(w.occupancy_rate, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                                <CardFooter className="pt-2 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 flex items-center justify-between text-xs text-neutral-500 px-6 py-3">
                                    <span className="flex items-center gap-1 font-mono">
                                        <Database className="h-3.5 w-3.5" /> ID : #{w.id}
                                    </span>
                                    <span>
                                        {w.occupancy_rate >= 95 ? (
                                            <span className="text-rose-500 font-semibold flex items-center gap-1">
                                                <ShieldAlert className="h-3.5 w-3.5" /> Saturé
                                            </span>
                                        ) : 'Espace disponible'}
                                    </span>
                                </CardFooter>
                            </Card>
                        ))
                    )}
                </div>

                {/* Add Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Créer un Entrepôt</DialogTitle>
                            <DialogDescription>Renseignez les détails du nouvel entrepôt logistique.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAdd} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="name">Nom de l'entrepôt</Label>
                                <Input 
                                    id="name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required 
                                />
                                {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="address">Adresse physique</Label>
                                <Input 
                                    id="address" 
                                    value={data.address} 
                                    onChange={e => setData('address', e.target.value)} 
                                />
                                {errors.address && <p className="text-xs text-rose-500">{errors.address}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="capacity">Capacité de stockage maximale (en unités)</Label>
                                <Input 
                                    id="capacity" 
                                    type="number" 
                                    value={data.capacity} 
                                    onChange={e => setData('capacity', parseInt(e.target.value) || 0)} 
                                    required 
                                    min="1"
                                />
                                {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={processing}>Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier l'Entrepôt</DialogTitle>
                            <DialogDescription>Mettez à jour les informations de l'entrepôt sélectionné.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="edit-name">Nom de l'entrepôt</Label>
                                <Input 
                                    id="edit-name" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)} 
                                    required 
                                />
                                {errors.name && <p className="text-xs text-rose-500">{errors.name}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-address">Adresse physique</Label>
                                <Input 
                                    id="edit-address" 
                                    value={data.address} 
                                    onChange={e => setData('address', e.target.value)} 
                                />
                                {errors.address && <p className="text-xs text-rose-500">{errors.address}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-capacity">Capacité de stockage maximale (en unités)</Label>
                                <Input 
                                    id="edit-capacity" 
                                    type="number" 
                                    value={data.capacity} 
                                    onChange={e => setData('capacity', parseInt(e.target.value) || 0)} 
                                    required 
                                    min="1"
                                />
                                {errors.capacity && <p className="text-xs text-rose-500">{errors.capacity}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={processing}>Enregistrer les modifications</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}

WarehousesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Entrepôts',
            href: '/warehouses',
        },
    ],
};
