import { Head, useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { 
    Warehouse as WarehouseIcon, 
    MapPin, 
    Search, 
    ChevronDown, 
    ChevronUp, 
    AlertTriangle, 
    Sliders, 
    Database, 
    Layers, 
    ArrowLeft
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

interface StockData {
    warehouse_id: number;
    warehouse_name: string;
    quantity: number;
    min_stock_override: number | null;
}

interface ItemData {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    category: string;
    price: number;
    min_stock: number;
    warehouse_quantity: number;
    warehouse_min_stock_override: number | null;
    is_low_stock: boolean;
    stocks: StockData[];
}

interface WarehouseData {
    id: number;
    name: string;
    address: string | null;
    capacity: number;
    current_stock: number;
    occupancy_rate: number;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedItems {
    data: ItemData[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface Props {
    warehouse: WarehouseData;
    items: PaginatedItems;
    categories: string[];
    canManage: boolean;
    canManageAlerts: boolean;
    filters: {
        search?: string;
        category?: string;
        alert?: string;
    };
}

export default function WarehouseShow({ warehouse, items, categories, canManage, canManageAlerts, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || 'ALL');
    const [alertFilter, setAlertFilter] = useState(filters.alert || 'ALL');
    
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

    // Form for specific warehouse overrides / stock setting
    const alertForm = useForm({
        warehouse_id: warehouse.id.toString(),
        min_stock_override: '' as any,
        quantity: '' as any,
    });

    // Handle immediate updates for selectors
    const handleCategoryChange = (val: string) => {
        setCategoryFilter(val);
        router.get(`/warehouses/${warehouse.id}`, {
            search: search,
            category: val,
            alert: alertFilter,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const handleAlertChange = (val: string) => {
        setAlertFilter(val);
        router.get(`/warehouses/${warehouse.id}`, {
            search: search,
            category: categoryFilter,
            alert: val,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    // Debounced search
    useEffect(() => {
        if (search === (filters.search || '')) return;

        const timer = setTimeout(() => {
            router.get(`/warehouses/${warehouse.id}`, {
                search: search,
                category: categoryFilter,
                alert: alertFilter,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const filteredItems = items.data;

    const handleAlertOpen = (item: ItemData) => {
        setSelectedItem(item);
        alertForm.setData({
            warehouse_id: warehouse.id.toString(),
            min_stock_override: item.warehouse_min_stock_override !== null ? item.warehouse_min_stock_override.toString() : '',
            quantity: item.warehouse_quantity.toString(),
        });
        setIsAlertOpen(true);
    };

    const submitAlertOverride = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        
        const payload = {
            warehouse_id: warehouse.id,
            min_stock_override: alertForm.data.min_stock_override !== '' && alertForm.data.min_stock_override !== null ? parseInt(alertForm.data.min_stock_override) : null,
            quantity: alertForm.data.quantity !== '' && alertForm.data.quantity !== null ? parseInt(alertForm.data.quantity) : null,
        };

        router.post(`/items/${selectedItem.id}/alerts`, payload, {
            onSuccess: () => {
                setIsAlertOpen(false);
                alertForm.reset();
            }
        });
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(val);
    };

    return (
        <>
            <Head title={`Inventaire - ${warehouse.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header Back Button */}
                <div className="flex items-center gap-3">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.get('/warehouses')}
                        className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm font-medium text-neutral-500">Retour aux entrepôts</span>
                </div>

                {/* Warehouse Summary Details */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="md:col-span-2 border border-neutral-200/60 dark:border-neutral-800">
                        <div className="p-6 flex flex-col justify-between h-full space-y-4">
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                    <WarehouseIcon className="h-6 w-6 text-blue-500 shrink-0" />
                                    {warehouse.name}
                                </h1>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-neutral-400" />
                                    {warehouse.address || 'Adresse non spécifiée'}
                                </p>
                            </div>
                            
                            {/* Capacity Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-xs font-semibold">
                                    <span className="text-neutral-500">Capacité de stockage utilisée</span>
                                    <span>{warehouse.current_stock} / {warehouse.capacity} U ({warehouse.occupancy_rate}%)</span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-500 ${
                                            warehouse.occupancy_rate > 90 
                                                ? 'bg-rose-500' 
                                                : warehouse.occupancy_rate > 70 
                                                    ? 'bg-amber-500' 
                                                    : 'bg-emerald-500'
                                        }`}
                                        style={{ width: `${Math.min(warehouse.occupancy_rate, 100)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="border border-neutral-200/60 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/10 flex flex-col justify-center p-6 text-center">
                        <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                        <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Identifiant Unique</h3>
                        <p className="text-2xl font-bold mt-1 text-neutral-800 dark:text-neutral-200">#{warehouse.id}</p>
                    </Card>
                </div>

                {/* Section Title */}
                <div>
                    <h2 className="text-lg font-bold">Articles en stock</h2>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        Liste complète des produits et volumes stockés dans cet entrepôt.
                    </p>
                </div>

                {/* Filters Row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                        <Input 
                            placeholder="Rechercher par nom ou SKU..." 
                            value={search} 
                            onChange={e => setSearch(e.target.value)} 
                            className="pl-9"
                        />
                    </div>
                    
                    <div className="w-full sm:w-[180px]">
                        <select 
                            value={categoryFilter} 
                            onChange={e => handleCategoryChange(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="ALL">Toutes catégories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full sm:w-[180px]">
                        <select 
                            value={alertFilter} 
                            onChange={e => handleAlertChange(e.target.value)}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="LOW">Stock Critique (Alerte)</option>
                            <option value="OK">Stock Correct</option>
                        </select>
                    </div>
                </div>

                {/* Items List Table */}
                <div className="rounded-xl border border-neutral-200/50 bg-white dark:border-neutral-800 dark:bg-neutral-900/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="p-4 w-[60px]"></th>
                                    <th className="p-4">SKU</th>
                                    <th className="p-4">Désignation</th>
                                    <th className="p-4">Catégorie</th>
                                    <th className="p-4">Prix HT</th>
                                    <th className="p-4">Seuil d'alerte</th>
                                    <th className="p-4 text-right">Stock entrepôt</th>
                                    <th className="p-4">Alerte</th>
                                    {canManageAlerts && <th className="p-4 text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="p-8 text-center text-neutral-500">
                                            Aucun article trouvé.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredItems.map(item => (
                                        <>
                                            <tr key={item.id} className="border-b border-neutral-100 hover:bg-neutral-50/20 dark:border-neutral-800 dark:hover:bg-neutral-900/10 transition-colors">
                                                <td className="p-4">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                                                        className="h-8 w-8"
                                                    >
                                                        {expandedItem === item.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                                    </Button>
                                                </td>
                                                <td className="p-4 font-mono font-bold text-neutral-800 dark:text-neutral-200">{item.sku}</td>
                                                <td className="p-4 font-medium">{item.name}</td>
                                                <td className="p-4">
                                                    <Badge variant="outline">{item.category}</Badge>
                                                </td>
                                                <td className="p-4">{formatCurrency(item.price)}</td>
                                                <td className="p-4 font-mono">
                                                    {item.warehouse_min_stock_override !== null ? (
                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold" title="Seuil personnalisé pour cet entrepôt">
                                                            {item.warehouse_min_stock_override} U
                                                        </span>
                                                    ) : (
                                                        <span className="text-neutral-500" title="Seuil global">
                                                            {item.min_stock} U
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-right font-mono font-bold">{item.warehouse_quantity} U</td>
                                                <td className="p-4">
                                                    {item.is_low_stock ? (
                                                        <Badge variant="destructive" className="gap-1 animate-pulse">
                                                            <AlertTriangle className="h-3 w-3" /> Bas Stock
                                                        </Badge>
                                                    ) : (
                                                        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-0 dark:bg-emerald-950/30 dark:text-emerald-400">
                                                            OK
                                                        </Badge>
                                                    )}
                                                </td>
                                                {canManageAlerts && (
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => handleAlertOpen(item)}
                                                                className="h-8 gap-1.5"
                                                            >
                                                                <Sliders className="h-3.5 w-3.5" /> Ajuster stock / alerte
                                                            </Button>
                                                        </div>
                                                    </td>
                                                )}
                                            </tr>
                                            {/* Expandable Stock Details */}
                                            {expandedItem === item.id && (
                                                <tr className="bg-neutral-50/50 dark:bg-neutral-900/5">
                                                    <td colSpan={9} className="p-4 border-b border-neutral-100 dark:border-neutral-800">
                                                        <div className="pl-14 space-y-3">
                                                            <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                                                                <Layers className="h-3.5 w-3.5" /> Répartition du stock dans les entrepôts
                                                            </h4>
                                                            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                                                                {item.stocks.length === 0 ? (
                                                                    <p className="text-xs text-neutral-500 italic">Aucune quantité en stock.</p>
                                                                ) : (
                                                                    item.stocks.map((stock, sIdx) => {
                                                                        const threshold = stock.min_stock_override !== null ? stock.min_stock_override : item.min_stock;
                                                                        const isL = stock.quantity <= threshold;
                                                                        const isCurrent = stock.warehouse_id === warehouse.id;
                                                                        return (
                                                                            <Card key={sIdx} className={`border ${isCurrent ? 'border-blue-500 dark:border-blue-600 bg-blue-50/20 dark:bg-blue-950/10' : 'border-neutral-100 dark:border-neutral-800'}`}>
                                                                                <CardContent className="p-3 flex items-center justify-between">
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold">
                                                                                            {stock.warehouse_name}
                                                                                            {isCurrent && <span className="ml-1 text-[9px] bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400 px-1 rounded">Actuel</span>}
                                                                                        </p>
                                                                                        <p className="text-[10px] text-neutral-400">
                                                                                            Alerte : {stock.min_stock_override !== null ? `${stock.min_stock_override} (spécifique)` : `${item.min_stock} (global)`}
                                                                                        </p>
                                                                                    </div>
                                                                                    <div className="text-right">
                                                                                        <span className={`text-sm font-bold font-mono ${isL ? 'text-rose-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                                                                                            {stock.quantity} U
                                                                                        </span>
                                                                                        {isL && <p className="text-[10px] text-rose-500 font-semibold">Stock critique</p>}
                                                                                    </div>
                                                                                </CardContent>
                                                                            </Card>
                                                                        );
                                                                    })
                                                                )}
                                                            </div>
                                                            {item.description && (
                                                                <div className="text-xs text-neutral-500 mt-2 bg-white dark:bg-neutral-900 p-2.5 rounded-lg border border-neutral-100 dark:border-neutral-800 max-w-xl">
                                                                    <strong>Description :</strong> {item.description}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {items.last_page > 1 && (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Affichage de <span className="font-semibold text-neutral-700 dark:text-neutral-200">{items.from || 0}</span> à <span className="font-semibold text-neutral-700 dark:text-neutral-200">{items.to || 0}</span> sur <span className="font-semibold text-neutral-700 dark:text-neutral-200">{items.total}</span> articles
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                                {items.links.map((link, idx) => {
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

                {/* Adjust Alert thresholds & stock override Dialog */}
                <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Paramètres de Stock - {selectedItem?.name}</DialogTitle>
                            <DialogDescription>Configurez les seuils de sécurité et les quantités dans l'entrepôt {warehouse.name}.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAlertOverride} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="min_stock_override">
                                    Seuil d'alerte spécifique (laisser vide pour utiliser le seuil global : {selectedItem?.min_stock} U)
                                </Label>
                                <Input 
                                    id="min_stock_override" 
                                    type="number"
                                    value={alertForm.data.min_stock_override}
                                    onChange={e => alertForm.setData('min_stock_override', e.target.value)}
                                    placeholder="Ex: 5"
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="alert-qty">
                                    Ajustement direct de stock (Quantité actuelle)
                                </Label>
                                <Input 
                                    id="alert-qty" 
                                    type="number"
                                    value={alertForm.data.quantity}
                                    onChange={e => alertForm.setData('quantity', e.target.value)}
                                    placeholder="Laisser vide pour ne pas modifier la quantité"
                                />
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAlertOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={alertForm.processing}>Mettre à jour</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

            </div>
        </>
    );
}

WarehouseShow.layout = {
    breadcrumbs: [
        {
            title: 'Entrepôts',
            href: '/warehouses',
        },
        {
            title: 'Inventaire',
            href: '#',
        },
    ],
};
