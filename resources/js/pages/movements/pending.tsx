import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Check, 
    X, 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowLeftRight,
    User,
    MessageSquare,
    AlertCircle
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
    status: 'pending';
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
}

export default function PendingValidationsIndex({ movements }: Props) {
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [selectedMovement, setSelectedMovement] = useState<MovementData | null>(null);

    const rejectForm = useForm({
        rejection_reason: '',
    });

    const handleValidate = (mov: MovementData) => {
        if (confirm(`Voulez-vous valider le mouvement #${mov.id} et mettre à jour les stocks ?`)) {
            router.post(`/movements/${mov.id}/validate`);
        }
    };

    const handleRejectOpen = (mov: MovementData) => {
        setSelectedMovement(mov);
        rejectForm.reset();
        setIsRejectOpen(true);
    };

    const submitReject = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedMovement) return;

        rejectForm.post(`/movements/${selectedMovement.id}/reject`, {
            onSuccess: () => {
                setIsRejectOpen(false);
                rejectForm.reset();
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
            <Head title="Approbation des mouvements" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <Clock className="h-6 w-6 text-rose-500" /> Approbations en attente
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Validez ou rejetez les demandes de mouvements de stock initiées par les opérateurs terrain.
                    </p>
                </div>

                {/* Table card */}
                <Card className="border border-neutral-200/50 dark:border-neutral-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-md font-bold">Demandes en attente ({movements.total})</CardTitle>
                        <CardDescription>
                            Chaque approbation vérifie et met à jour automatiquement la capacité de l'entrepôt.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                    <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                        <th className="p-4 w-[85px]">ID</th>
                                        <th className="p-4">Date</th>
                                        <th className="p-4">Type</th>
                                        <th className="p-4">Article</th>
                                        <th className="p-4">Quantité</th>
                                        <th className="p-4">Source</th>
                                        <th className="p-4">Destination</th>
                                        <th className="p-4">Demandé Par</th>
                                        <th className="p-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.data.length === 0 ? (
                                        <tr>
                                            <td colSpan={9} className="p-12 text-center text-neutral-500">
                                                <div className="flex flex-col items-center justify-center gap-2">
                                                    <AlertCircle className="h-8 w-8 text-neutral-400" />
                                                    <span className="text-sm font-semibold">Aucune demande en attente de validation</span>
                                                    <p className="text-xs text-neutral-400 max-w-sm">
                                                        Les demandes créées par les opérateurs s'afficheront ici.
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        movements.data.map(mov => (
                                            <tr key={mov.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/10">
                                                <td className="p-4 font-mono font-semibold">#{mov.id}</td>
                                                <td className="p-4 text-xs text-neutral-500">{formatDate(mov.created_at)}</td>
                                                <td className="p-4">
                                                    <Badge className={`${
                                                        mov.type === 'IN' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400' : 
                                                        mov.type === 'OUT' ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/30 dark:text-rose-400' : 
                                                        'bg-blue-100 text-blue-800 dark:bg-blue-950/30 dark:text-blue-400'
                                                    } border-0 flex items-center w-fit gap-1 text-[10px] font-bold`}>
                                                        {mov.type === 'IN' && <ArrowDownRight className="h-3 w-3" />}
                                                        {mov.type === 'OUT' && <ArrowUpRight className="h-3 w-3" />}
                                                        {mov.type === 'TRANSFER' && <ArrowLeftRight className="h-3 w-3" />}
                                                        {mov.type}
                                                    </Badge>
                                                </td>
                                                <td className="p-4">
                                                    <div className="font-semibold">{mov.item?.name}</div>
                                                    <div className="text-xs text-neutral-400">{mov.item?.sku}</div>
                                                </td>
                                                <td className="p-4 font-bold font-mono text-neutral-800 dark:text-neutral-200">{mov.quantity} U</td>
                                                <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">{mov.source_warehouse?.name || '-'}</td>
                                                <td className="p-4 text-xs text-neutral-600 dark:text-neutral-400">{mov.destination_warehouse?.name || '-'}</td>
                                                <td className="p-4 text-xs">
                                                    <div className="flex items-center gap-1 font-medium">
                                                        <User className="h-3.5 w-3.5 text-neutral-400" />
                                                        {mov.creator?.name}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-1.5">
                                                        <Button 
                                                            size="sm" 
                                                            onClick={() => handleValidate(mov)}
                                                            className="bg-emerald-600 hover:bg-emerald-700 h-8 gap-1 text-xs"
                                                        >
                                                            <Check className="h-3.5 w-3.5" /> Valider
                                                        </Button>
                                                        <Button 
                                                            size="sm" 
                                                            variant="destructive" 
                                                            onClick={() => handleRejectOpen(mov)}
                                                            className="h-8 gap-1 text-xs"
                                                        >
                                                            <X className="h-3.5 w-3.5" /> Rejeter
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
                        {movements.last_page > 1 && (
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                    Affichage de <span className="font-semibold text-neutral-700 dark:text-neutral-200">{movements.from || 0}</span> à <span className="font-semibold text-neutral-700 dark:text-neutral-200">{movements.to || 0}</span> sur <span className="font-semibold text-neutral-700 dark:text-neutral-200">{movements.total}</span> demandes
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

                {/* Reject dialog */}
                <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Rejeter le mouvement de stock</DialogTitle>
                            <DialogDescription>
                                Spécifiez le motif de rejet pour le mouvement de stock #{selectedMovement?.id}.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitReject} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="reason">Motif du rejet</Label>
                                <div className="relative">
                                    <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                                    <Input 
                                        id="reason" 
                                        placeholder="Ex: Quantité inexacte, rupture de stock..."
                                        value={rejectForm.data.rejection_reason} 
                                        onChange={e => rejectForm.setData('rejection_reason', e.target.value)} 
                                        className="pl-9"
                                        required 
                                    />
                                </div>
                                {rejectForm.errors.rejection_reason && <p className="text-xs text-rose-500">{rejectForm.errors.rejection_reason}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsRejectOpen(false)}>Annuler</Button>
                                <Button type="submit" variant="destructive" disabled={rejectForm.processing}>
                                    Confirmer le rejet
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}

PendingValidationsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Approbations',
            href: '/validations',
        },
    ],
};
