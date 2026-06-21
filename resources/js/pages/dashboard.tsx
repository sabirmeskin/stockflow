import { Head, Link } from '@inertiajs/react';
import { 
    Warehouse, 
    Boxes, 
    TrendingUp, 
    AlertTriangle, 
    Activity,
    FileSpreadsheet,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    ArrowLeftRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Props {
    stats: {
        total_warehouses: number;
        total_items: number;
        total_stock_value: number;
        pending_movements: number;
        active_alerts: number;
    };
    warehouses_occupancy: Array<{
        name: string;
        current_stock: number;
        capacity: number;
        occupancy_rate: number;
    }>;
    recent_movements: Array<{
        id: number;
        type: 'IN' | 'OUT' | 'TRANSFER';
        item_name: string;
        sku: string;
        source_name: string;
        dest_name: string;
        quantity: number;
        status: 'pending' | 'validated' | 'rejected';
        created_at: string;
    }>;
    low_stock_list: Array<{
        item_name: string;
        sku: string;
        warehouse_name: string;
        quantity: number;
        threshold: number;
    }>;
    movements_stats: {
        IN: number;
        OUT: number;
        TRANSFER: number;
    };
    category_stats: Record<string, number>;
}

export default function Dashboard({ 
    stats, 
    warehouses_occupancy, 
    recent_movements, 
    low_stock_list, 
    movements_stats, 
    category_stats 
}: Props) {
    
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
    };

    return (
        <>
            <Head title="Tableau de bord" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6">
                
                {/* Header Actions */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Vue d'ensemble de vos entrepôts et de vos stocks en temps réel.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/stock/excel">
                                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                                Stock (Excel)
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/stock/pdf">
                                <FileText className="mr-2 h-4 w-4 text-rose-600" />
                                Stock (PDF)
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/movement/excel">
                                <FileSpreadsheet className="mr-2 h-4 w-4 text-emerald-600" />
                                Mouvements (Excel)
                            </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                            <a href="/reports/movement/pdf">
                                <FileText className="mr-2 h-4 w-4 text-rose-600" />
                                Mouvements (PDF)
                            </a>
                        </Button>
                    </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Card className="border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Entrepôts</CardTitle>
                            <Warehouse className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_warehouses}</div>
                            <p className="text-xs text-neutral-500">Unités enregistrées</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Articles</CardTitle>
                            <Boxes className="h-4 w-4 text-indigo-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.total_items}</div>
                            <p className="text-xs text-neutral-500">Références uniques</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Valeur Stock</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{formatCurrency(stats.total_stock_value)}</div>
                            <p className="text-xs text-neutral-500">Valorisation totale</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Alertes Seuil</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-500">{stats.active_alerts}</div>
                            <p className="text-xs text-neutral-500">Stocks sous le seuil min</p>
                        </CardContent>
                    </Card>

                    <Card className="border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">En attente</CardTitle>
                            <Activity className="h-4 w-4 text-rose-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-rose-500">{stats.pending_movements}</div>
                            <p className="text-xs text-neutral-500">Mouvements à valider</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Layout */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Warehouse Capacity Occupancy */}
                    <Card className="col-span-1 lg:col-span-2 border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader>
                            <CardTitle>Taux d'occupation des entrepôts</CardTitle>
                            <CardDescription>Capacité utilisée en volume de stock actuel.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {warehouses_occupancy.length === 0 ? (
                                <p className="text-sm text-neutral-500">Aucun entrepôt configuré.</p>
                            ) : (
                                warehouses_occupancy.map((w, i) => (
                                    <div key={i} className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="font-medium">{w.name}</span>
                                            <span className="text-neutral-500">
                                                {w.current_stock} / {w.capacity} unités ({w.occupancy_rate}%)
                                            </span>
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
                                ))
                            )}
                        </CardContent>
                    </Card>

                    {/* Quick Stock Alerts Warning */}
                    <Card className="col-span-1 border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader>
                            <CardTitle className="text-amber-600 dark:text-amber-500 flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5" /> Stock Critique
                            </CardTitle>
                            <CardDescription>Articles sous le seuil minimum de sécurité.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {low_stock_list.length === 0 ? (
                                    <p className="text-sm text-neutral-500">Aucune alerte de stock active.</p>
                                ) : (
                                    low_stock_list.map((item, idx) => (
                                        <div key={idx} className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800 last:border-0 last:pb-0">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold">{item.item_name}</p>
                                                <p className="text-xs text-neutral-500">{item.sku} • {item.warehouse_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant="destructive" className="font-mono text-xs">
                                                    {item.quantity} en stock
                                                </Badge>
                                                <p className="text-[10px] text-neutral-500 mt-1">Seuil : {item.threshold}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Lower Layout - Recent Movements & Category Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    
                    {/* Recent Movements */}
                    <Card className="col-span-1 lg:col-span-2 border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Mouvements Récents</CardTitle>
                                <CardDescription>Les 5 derniers mouvements de marchandises enregistrés.</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/movements">Voir tout</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recent_movements.length === 0 ? (
                                    <p className="text-sm text-neutral-500">Aucun mouvement enregistré.</p>
                                ) : (
                                    recent_movements.map((mov) => (
                                        <div key={mov.id} className="flex items-center justify-between border-b border-neutral-100 pb-3 dark:border-neutral-800 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${
                                                    mov.type === 'IN' 
                                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' 
                                                        : mov.type === 'OUT'
                                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                                                            : 'bg-blue-50 text-blue-600 dark:bg-blue-950/20'
                                                }`}>
                                                    {mov.type === 'IN' && <ArrowDownRight className="h-4 w-4" />}
                                                    {mov.type === 'OUT' && <ArrowUpRight className="h-4 w-4" />}
                                                    {mov.type === 'TRANSFER' && <ArrowLeftRight className="h-4 w-4" />}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold">{mov.item_name}</p>
                                                    <p className="text-xs text-neutral-500">
                                                        {mov.type === 'IN' && `Vers ${mov.dest_name}`}
                                                        {mov.type === 'OUT' && `Depuis ${mov.source_name}`}
                                                        {mov.type === 'TRANSFER' && `${mov.source_name} ➔ ${mov.dest_name}`}
                                                        {` • ${mov.created_at}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-bold font-mono">
                                                    {mov.type === 'OUT' ? '-' : '+'}{mov.quantity}
                                                </p>
                                                <Badge className={`text-[10px] mt-1 ${
                                                    mov.status === 'validated' 
                                                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                        : mov.status === 'pending'
                                                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                                                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400'
                                                }`}>
                                                    {mov.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Stock by Category Breakdown */}
                    <Card className="col-span-1 border border-neutral-200/50 dark:border-neutral-800/50">
                        <CardHeader>
                            <CardTitle>Répartition par catégorie</CardTitle>
                            <CardDescription>Quantité totale de pièces en stock.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.keys(category_stats).length === 0 ? (
                                    <p className="text-sm text-neutral-500">Pas de stock disponible.</p>
                                ) : (
                                    Object.entries(category_stats).map(([cat, qty], idx) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex items-center justify-between text-xs">
                                                <span className="font-semibold">{cat}</span>
                                                <span className="text-neutral-500 font-mono">{qty} unités</span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-neutral-100 dark:bg-neutral-800">
                                                <div 
                                                    className="h-1.5 rounded-full bg-indigo-500"
                                                    style={{ 
                                                        width: `${Math.min(
                                                            (qty / (Object.values(category_stats).reduce((a, b) => a + b, 0) || 1)) * 100, 
                                                            100
                                                        )}%` 
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Tableau de bord',
            href: '/dashboard',
        },
    ],
};
