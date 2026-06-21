import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Plus, 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowLeftRight, 
    AlertCircle, 
    FileSpreadsheet, 
    FileText,
    User,
    UserCheck,
    MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ItemStock {
    warehouse_id: number;
    quantity: number;
}

interface ItemData {
    id: number;
    sku: string;
    name: string;
    stocks: ItemStock[];
}

interface WarehouseData {
    id: number;
    name: string;
}

interface MovementData {
    id: number;
    type: 'IN' | 'OUT' | 'TRANSFER';
    item: {
        id: number;
        sku: string;
        name: string;
    } | null;
    source_warehouse: {
        id: number;
        name: string;
    } | null;
    destination_warehouse: {
        id: number;
        name: string;
    } | null;
    quantity: number;
    creator: {
        name: string;
    } | null;
    validator: {
        name: string;
    } | null;
    status: 'pending' | 'validated' | 'rejected';
    rejection_reason: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedMovements {
    data: MovementData[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface Props {
    movements: PaginatedMovements;
    warehouses: WarehouseData[];
    items: ItemData[];
    canCreate: boolean;
}

export default function MovementsIndex({ movements, warehouses, items, canCreate }: Props) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    // Form for creating movements
    const createForm = useForm({
        type: 'IN',
        item_id: '',
        quantity: 1,
        source_warehouse_id: '',
        destination_warehouse_id: '',
    });

    // Stock verification feedback on client-side
    const [availableStock, setAvailableStock] = useState<number | null>(null);
    const [isStockInsufficient, setIsStockInsufficient] = useState(false);

    const watchType = createForm.data.type;
    const watchItem = createForm.data.item_id;
    const watchSource = createForm.data.source_warehouse_id;
    const watchQuantity = createForm.data.quantity;

    useEffect(() => {
        if ((watchType === 'OUT' || watchType === 'TRANSFER') && watchItem && watchSource) {
            const item = items.find(i => i.id.toString() === watchItem);
            const stock = item?.stocks.find(s => s.warehouse_id.toString() === watchSource);
            const qty = stock ? stock.quantity : 0;
            setAvailableStock(qty);
            setIsStockInsufficient(watchQuantity > qty);
        } else {
            setAvailableStock(null);
            setIsStockInsufficient(false);
        }
    }, [watchType, watchItem, watchSource, watchQuantity, items]);

    const handleCreateOpen = () => {
        createForm.reset();
        setIsCreateOpen(true);
    };

    const submitCreate = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Prevent submit if stock is insufficient client-side (redundant safeguard)
        if (isStockInsufficient) {
            alert('Impossible de soumettre : le stock est insuffisant.');
            return;
        }

        createForm.post('/movements', {
            onSuccess: () => {
                setIsCreateOpen(false);
                createForm.reset();
            }
        });
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <>
            <Head title="Mouvements de stock" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Section */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Mouvements de Stocks</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Suivez l'historique complet et enregistrez les flux de marchandises de vos entrepôts.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/movement/excel">
                                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Export Excel
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/movement/pdf">
                                <FileText className="mr-2 h-4 w-4 text-rose-600" /> Export PDF
                            </a>
                        </Button>
                        {canCreate && (
                            <Button onClick={handleCreateOpen} className="gap-2">
                                <Plus className="h-4 w-4" /> Enregistrer un flux
                            </Button>
                        )}
                    </div>
                </div>

                {/* History Section */}
                <Card className="border border-neutral-200/50 dark:border-neutral-800">
                    <CardHeader>
                        <CardTitle>Historique général des flux</CardTitle>
                        <CardDescription>Consultez l'historique complet de tous les mouvements validés, en attente et rejetés.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        <th className="p-4">ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Article</th>
                                        <th className="p-4">Quantité</th>
                                        <th className="p-4">Source</th>
                                        <th className="p-4">Destination</th>
                                        <th className="p-4">Auteur</th>
                                        <th className="p-4">Statut</th>
                                        <th className="p-4">Détails de validation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={10} className="p-8 text-center text-neutral-500">
                                                Aucun mouvement de stock disponible.
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.data.map(mov => (
                                            <tr key={mov.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/20">
                                                <td className="p-4 font-mono text-xs">#{mov.id}</td>
                                                <td className="p-4 text-xs text-neutral-500">{formatDate(mov.created_at)}</td>
                                                <td className="p-4">
                                                    <div className="flex items-center gap-1.5 font-semibold text-xs">
                                                        {mov.type === 'IN' && <ArrowDownRight className="h-4 w-4 text-emerald-500" />}
                                                        {mov.type === 'OUT' && <ArrowUpRight className="h-4 w-4 text-rose-500" />}
                                                        {mov.type === 'TRANSFER' && <ArrowLeftRight className="h-4 w-4 text-blue-500" />}
                                                        <span>{mov.type}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold">{mov.item?.name}</div>
                                                    <div className="text-xs text-neutral-400">{mov.item?.sku}</div>
                                                </td>
                                                <td className="p-4 font-bold font-mono">{mov.quantity} U</td>
                                                <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">{mov.source_warehouse?.name || '-'}</td>
                                                <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">{mov.destination_warehouse?.name || '-'}</td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="flex items-center gap-1">
                                                            <User className="h-3 w-3 text-neutral-400" />
                                                            {mov.creator?.name || 'Système'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <Badge className={`${
                                                        mov.status === 'validated' 
                                                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' :
                                                        mov.status === 'rejected'
                                                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400'
                                                            : 'bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400'
                                                    } border-0 flex items-center w-fit gap-1 text-[10px] font-bold`}>
                                                        {mov.status === 'pending' ? 'en attente' : (mov.status === 'validated' ? 'validé' : 'rejeté')}
                                                    </Badge>
                                                </td>
                                                <td className="p-4 text-xs text-neutral-500">
                                                    {mov.status === 'pending' ? (
                                                        <span className="text-neutral-400 italic">En attente d'approbation</span>
                                                    ) : mov.status === 'validated' ? (
                                                        <div className="flex items-center gap-1">
                                                            <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                                                            <span>Validé par {mov.validator?.name}</span>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col gap-0.5 text-rose-600">
                                                            <span className="flex items-center gap-1">
                                                                <MessageSquare className="h-3.5 w-3.5" />
                                                                Rejeté par {mov.validator?.name}
                                                            </span>
                                                            {mov.rejection_reason && (
                                                                <span className="italic text-[10px] text-neutral-400 ml-4">
                                                                    "{mov.rejection_reason}"
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination Controls */}
                        {movements.last_page > 1 && (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Affichage de <span className="font-semibold text-neutral-700 dark:text-neutral-200">{movements.from || 0}</span> à <span className="font-semibold text-neutral-700 dark:text-neutral-200">{movements.to || 0}</span> sur <span className="font-semibold text-neutral-700 dark:text-neutral-200">{movements.total}</span> mouvements
                                </p>
                                <div className="flex items-center gap-1 flex-wrap">
                                    {movements.links.map((link, idx) => {
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
                    </CardContent>
                </Card>

                {/* Create dialog */}
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Saisie de Mouvement de Stock</DialogTitle>
                            <DialogDescription>Enregistrez un flux d'entrée, de sortie ou de transfert.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitCreate} className="space-y-4 py-2">
                            {/* Type Selection */}
                            <div className="space-y-1">
                                <Label htmlFor="type">Type de flux</Label>
                                <Select 
                                    value={createForm.data.type} 
                                    onValueChange={val => createForm.setData('type', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir le type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="IN">Entrée (IN)</SelectItem>
                                        <SelectItem value="OUT">Sortie (OUT)</SelectItem>
                                        <SelectItem value="TRANSFER">Transfert (TRANSFER)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Item Selection */}
                            <div className="space-y-1">
                                <Label htmlFor="item">Article</Label>
                                <Select 
                                    value={createForm.data.item_id} 
                                    onValueChange={val => createForm.setData('item_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un article" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {items.map(item => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.sku} - {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Source Warehouse (Only for OUT / TRANSFER) */}
                            {(createForm.data.type === 'OUT' || createForm.data.type === 'TRANSFER') && (
                                <div className="space-y-1">
                                    <Label htmlFor="source">Entrepôt Source</Label>
                                    <Select 
                                        value={createForm.data.source_warehouse_id} 
                                        onValueChange={val => createForm.setData('source_warehouse_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir l'entrepôt source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(w => (
                                                <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Destination Warehouse (Only for IN / TRANSFER) */}
                            {(createForm.data.type === 'IN' || createForm.data.type === 'TRANSFER') && (
                                <div className="space-y-1">
                                    <Label htmlFor="dest">Entrepôt Destination</Label>
                                    <Select 
                                        value={createForm.data.destination_warehouse_id} 
                                        onValueChange={val => createForm.setData('destination_warehouse_id', val)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Choisir l'entrepôt de destination" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {warehouses.map(w => (
                                                <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Quantity Input */}
                            <div className="space-y-1">
                                <Label htmlFor="qty">Quantité à déplacer</Label>
                                <Input 
                                    id="qty" 
                                    type="number" 
                                    min="1"
                                    value={createForm.data.quantity} 
                                    onChange={e => createForm.setData('quantity', parseInt(e.target.value) || 1)} 
                                    required 
                                />
                                {createForm.errors.quantity && <p className="text-xs text-rose-500">{createForm.errors.quantity}</p>}
                            </div>

                            {/* Stock Check Feedback Card */}
                            {availableStock !== null && (
                                <Alert variant={isStockInsufficient ? 'destructive' : 'default'} className="mt-2">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>{isStockInsufficient ? 'Stock insuffisant' : 'Stock vérifié'}</AlertTitle>
                                    <AlertDescription>
                                        Quantité disponible dans cet entrepôt : <span className="font-mono font-bold">{availableStock} U</span>.
                                        {isStockInsufficient && " Veuillez corriger la quantité."}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>Annuler</Button>
                                <Button 
                                    type="submit" 
                                    disabled={createForm.processing || isStockInsufficient}
                                    className={isStockInsufficient ? 'opacity-50 cursor-not-allowed' : ''}
                                >
                                    Soumettre
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}

MovementsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Mouvements',
            href: '/movements',
        },
    ],
};
