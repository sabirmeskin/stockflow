import { Head, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { 
    Plus, 
    Edit2, 
    Trash2, 
    AlertTriangle, 
    Sliders,
    Search,
    ChevronDown,
    ChevronUp,
    FileSpreadsheet,
    FileText,
    Percent,
    Tag,
    Layers,
    DollarSign
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
    total_stock: number;
    is_low_stock: boolean;
    alert_warehouses: string[];
    stocks: StockData[];
}

interface WarehouseData {
    id: number;
    name: string;
}

interface Props {
    items: ItemData[];
    warehouses: WarehouseData[];
    canManage: boolean;
    canManageAlerts: boolean;
}

export default function ItemsIndex({ items, warehouses, canManage, canManageAlerts }: Props) {
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [alertFilter, setAlertFilter] = useState('ALL');
    
    const [expandedItem, setExpandedItem] = useState<number | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);

    // Form for Item CRUD
    const itemForm = useForm({
        sku: '',
        name: '',
        description: '',
        category: '',
        price: 0,
        min_stock: 10,
    });

    // Form for specific warehouse overrides / stock setting
    const alertForm = useForm({
        warehouse_id: '',
        min_stock_override: '' as any,
        quantity: '' as any,
    });

    const categories = Array.from(new Set(items.map(item => item.category)));

    const filteredItems = items.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) || 
                              item.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
        const matchesAlert = alertFilter === 'ALL' || 
                             (alertFilter === 'LOW' && item.is_low_stock) || 
                             (alertFilter === 'OK' && !item.is_low_stock);
        return matchesSearch && matchesCategory && matchesAlert;
    });

    const handleAddOpen = () => {
        itemForm.reset();
        setIsAddOpen(true);
    };

    const handleEditOpen = (item: ItemData) => {
        setSelectedItem(item);
        itemForm.setData({
            sku: item.sku,
            name: item.name,
            description: item.description || '',
            category: item.category,
            price: item.price,
            min_stock: item.min_stock,
        });
        setIsEditOpen(true);
    };

    const handleAlertOpen = (item: ItemData) => {
        setSelectedItem(item);
        alertForm.reset();
        setIsAlertOpen(true);
    };

    const submitAdd = (e: React.FormEvent) => {
        e.preventDefault();
        itemForm.post('/items', {
            onSuccess: () => {
                setIsAddOpen(false);
                itemForm.reset();
            }
        });
    };

    const submitEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        itemForm.put(`/items/${selectedItem.id}`, {
            onSuccess: () => {
                setIsEditOpen(false);
                itemForm.reset();
            }
        });
    };

    const submitAlertOverride = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedItem) return;
        
        const payload = {
            warehouse_id: alertForm.data.warehouse_id,
            min_stock_override: alertForm.data.min_stock_override !== '' ? parseInt(alertForm.data.min_stock_override) : null,
            quantity: alertForm.data.quantity !== '' ? parseInt(alertForm.data.quantity) : null,
        };

        // Inertia raw request since we might send null/empty overrides
        useForm(payload).post(`/items/${selectedItem.id}/alerts`, {
            onSuccess: () => {
                setIsAlertOpen(false);
                alertForm.reset();
            }
        });
    };

    const handleDelete = (item: ItemData) => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer l'article "${item.name}" ?`)) {
            useForm().delete(`/items/${item.id}`);
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
    };

    return (
        <>
            <Head title="Gestion des articles" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Catalogue & Stocks</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Gérez les fiches articles, ajustez les stocks et surveillez les seuils d'alerte.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/stock/excel">
                                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" /> Export Excel
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/stock/pdf">
                                <FileText className="mr-2 h-4 w-4 text-rose-600" /> Export PDF
                            </a>
                        </Button>
                        {canManage && (
                            <Button size="sm" onClick={handleAddOpen} className="gap-2">
                                <Plus className="h-4 w-4" /> Nouvel Article
                            </Button>
                        )}
                    </div>
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
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Catégorie" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Toutes catégories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={alertFilter} onValueChange={setAlertFilter}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Statut Alerte" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Tous les statuts</SelectItem>
                            <SelectItem value="LOW">Stock Critique (Alerte)</SelectItem>
                            <SelectItem value="OK">Stock Correct</SelectItem>
                        </SelectContent>
                    </Select>
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
                                    <th className="p-4">Seuil global</th>
                                    <th className="p-4 text-right">Stock total</th>
                                    <th className="p-4">Alerte</th>
                                    { (canManage || canManageAlerts) && <th className="p-4 text-right">Actions</th>}
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
                                                <td className="p-4 font-mono">{item.min_stock} U</td>
                                                <td className="p-4 text-right font-mono font-bold">{item.total_stock} U</td>
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
                                                {(canManage || canManageAlerts) && (
                                                    <td className="p-4 text-right">
                                                        <div className="flex justify-end gap-1.5">
                                                            {canManageAlerts && (
                                                                <Button 
                                                                    variant="outline" 
                                                                    size="sm" 
                                                                    onClick={() => handleAlertOpen(item)}
                                                                    className="h-8 gap-1.5"
                                                                >
                                                                    <Sliders className="h-3.5 w-3.5" /> Ajuster / Alerte
                                                                </Button>
                                                            )}
                                                            {canManage && (
                                                                <>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        onClick={() => handleEditOpen(item)}
                                                                        className="h-8 w-8"
                                                                    >
                                                                        <Edit2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                    <Button 
                                                                        variant="ghost" 
                                                                        size="icon" 
                                                                        onClick={() => handleDelete(item)}
                                                                        className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10"
                                                                    >
                                                                        <Trash2 className="h-3.5 w-3.5" />
                                                                    </Button>
                                                                </>
                                                            )}
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
                                                                        return (
                                                                            <Card key={sIdx} className="border border-neutral-100 dark:border-neutral-800">
                                                                                <CardContent className="p-3 flex items-center justify-between">
                                                                                    <div>
                                                                                        <p className="text-xs font-semibold">{stock.warehouse_name}</p>
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
                </div>

                {/* Add Dialog */}
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Ajouter un Article</DialogTitle>
                            <DialogDescription>Renseignez la fiche produit pour le catalogue.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAdd} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="sku">SKU Code (Unique)</Label>
                                    <Input 
                                        id="sku" 
                                        placeholder="EX: EL-LAP-102"
                                        value={itemForm.data.sku} 
                                        onChange={e => itemForm.setData('sku', e.target.value)} 
                                        required 
                                    />
                                    {itemForm.errors.sku && <p className="text-xs text-rose-500">{itemForm.errors.sku}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="name">Désignation article</Label>
                                    <Input 
                                        id="name" 
                                        placeholder="Nom de l'article"
                                        value={itemForm.data.name} 
                                        onChange={e => itemForm.setData('name', e.target.value)} 
                                        required 
                                    />
                                    {itemForm.errors.name && <p className="text-xs text-rose-500">{itemForm.errors.name}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="category">Catégorie</Label>
                                    <Input 
                                        id="category" 
                                        placeholder="EX: Électronique"
                                        value={itemForm.data.category} 
                                        onChange={e => itemForm.setData('category', e.target.value)} 
                                        required 
                                    />
                                    {itemForm.errors.category && <p className="text-xs text-rose-500">{itemForm.errors.category}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="price">Prix Unitaire HT (EUR)</Label>
                                    <Input 
                                        id="price" 
                                        type="number" 
                                        step="0.01"
                                        value={itemForm.data.price} 
                                        onChange={e => itemForm.setData('price', parseFloat(e.target.value) || 0)} 
                                        required 
                                        min="0"
                                    />
                                    {itemForm.errors.price && <p className="text-xs text-rose-500">{itemForm.errors.price}</p>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="min_stock">Seuil d'alerte global (Quantité de sécurité)</Label>
                                <Input 
                                    id="min_stock" 
                                    type="number" 
                                    value={itemForm.data.min_stock} 
                                    onChange={e => itemForm.setData('min_stock', parseInt(e.target.value) || 0)} 
                                    required 
                                    min="0"
                                />
                                {itemForm.errors.min_stock && <p className="text-xs text-rose-500">{itemForm.errors.min_stock}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                    id="description" 
                                    value={itemForm.data.description} 
                                    onChange={e => itemForm.setData('description', e.target.value)} 
                                />
                                {itemForm.errors.description && <p className="text-xs text-rose-500">{itemForm.errors.description}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={itemForm.processing}>Créer l'article</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier l'Article</DialogTitle>
                            <DialogDescription>Mettez à jour les caractéristiques de l'article catalogue.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitEdit} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="edit-sku">SKU Code</Label>
                                    <Input 
                                        id="edit-sku" 
                                        value={itemForm.data.sku} 
                                        onChange={e => itemForm.setData('sku', e.target.value)} 
                                        required 
                                    />
                                    {itemForm.errors.sku && <p className="text-xs text-rose-500">{itemForm.errors.sku}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-name">Désignation article</Label>
                                    <Input 
                                        id="edit-name" 
                                        value={itemForm.data.name} 
                                        onChange={e => itemForm.setData('name', e.target.value)} 
                                        required 
                                    />
                                    {itemForm.errors.name && <p className="text-xs text-rose-500">{itemForm.errors.name}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <Label htmlFor="edit-category">Catégorie</Label>
                                    <Input 
                                        id="edit-category" 
                                        value={itemForm.data.category} 
                                        onChange={e => itemForm.setData('category', e.target.value)} 
                                        required 
                                    />
                                    {itemForm.errors.category && <p className="text-xs text-rose-500">{itemForm.errors.category}</p>}
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="edit-price">Prix HT (EUR)</Label>
                                    <Input 
                                        id="edit-price" 
                                        type="number" 
                                        step="0.01"
                                        value={itemForm.data.price} 
                                        onChange={e => itemForm.setData('price', parseFloat(e.target.value) || 0)} 
                                        required 
                                        min="0"
                                    />
                                    {itemForm.errors.price && <p className="text-xs text-rose-500">{itemForm.errors.price}</p>}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-min_stock">Seuil d'alerte global</Label>
                                <Input 
                                    id="edit-min_stock" 
                                    type="number" 
                                    value={itemForm.data.min_stock} 
                                    onChange={e => itemForm.setData('min_stock', parseInt(e.target.value) || 0)} 
                                    required 
                                    min="0"
                                />
                                {itemForm.errors.min_stock && <p className="text-xs text-rose-500">{itemForm.errors.min_stock}</p>}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="edit-description">Description</Label>
                                <Input 
                                    id="edit-description" 
                                    value={itemForm.data.description} 
                                    onChange={e => itemForm.setData('description', e.target.value)} 
                                />
                                {itemForm.errors.description && <p className="text-xs text-rose-500">{itemForm.errors.description}</p>}
                            </div>
                            <DialogFooter className="pt-4">
                                <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Annuler</Button>
                                <Button type="submit" disabled={itemForm.processing}>Enregistrer</Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Adjust Alert thresholds & initial stock override Dialog */}
                <Dialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Paramètres de Stock - {selectedItem?.name}</DialogTitle>
                            <DialogDescription>Configurez des seuils de sécurité personnalisés par entrepôt.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={submitAlertOverride} className="space-y-4 py-2">
                            <div className="space-y-1">
                                <Label htmlFor="alert-warehouse">Sélectionner l'entrepôt</Label>
                                <Select 
                                    value={alertForm.data.warehouse_id} 
                                    onValueChange={val => alertForm.setData('warehouse_id', val)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Choisir un entrepôt" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {warehouses.map(w => (
                                            <SelectItem key={w.id} value={w.id.toString()}>{w.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
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

ItemsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Articles',
            href: '/items',
        },
    ],
};
