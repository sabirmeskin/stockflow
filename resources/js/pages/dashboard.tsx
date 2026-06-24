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
    ArrowLeftRight,
    Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useRef, useState } from 'react';
import { DashboardReport, DashboardReportRef } from '@/components/DashboardReport';

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
    const dashboardRef = useRef<HTMLDivElement>(null);
    const reportRef = useRef<DashboardReportRef>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleDownloadPdf = async () => {
        if (!reportRef.current) return;
        setIsExporting(true);
        try {
            await reportRef.current.downloadPdf();
        } catch (error) {
            console.error('Export failed', error);
        } finally {
            setIsExporting(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(value);
    };

    const categoryData = Object.entries(category_stats).map(([name, value]) => ({ name, value }));
    const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

    const movementData = [
        { name: 'Entrées', value: movements_stats.IN },
        { name: 'Sorties', value: movements_stats.OUT },
        { name: 'Transferts', value: movements_stats.TRANSFER },
    ].filter(item => item.value > 0);
    const MOVEMENT_COLORS = ['#10b981', '#ef4444', '#3b82f6'];

    return (
        <>
            <Head title="Tableau de bord" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-6" ref={dashboardRef}>

                {/* Header Actions */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Vue d'ensemble de vos entrepôts et de vos stocks en temps réeeeeeeeeel.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={handleDownloadPdf} 
                            disabled={isExporting}
                        >
                            <FileText className={`mr-2 h-4 w-4 text-rose-600 ${isExporting ? 'animate-bounce' : ''}`} />
                            {isExporting ? 'Génération...' : 'Télécharger Rapport'}
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

                    {/* Warehouse Capacity Occupancy Chart */}
                    <Card className="col-span-1 lg:col-span-2 border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col">
                        <CardHeader>
                            <CardTitle>Taux d'occupation des entrepôts</CardTitle>
                            <CardDescription>Comparaison de la capacité utilisée en volume de stock actuel.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[300px]">
                            {warehouses_occupancy.length === 0 ? (
                                <p className="text-sm text-neutral-500">Aucun entrepôt configuré.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={warehouses_occupancy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                                        <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            labelStyle={{ color: '#6b7280' }}
                                        />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar dataKey="current_stock" name="Stock Actuel" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                        <Bar dataKey="capacity" name="Capacité Totale" fill="#a75fdeff" radius={[4, 4, 0, 0]} maxBarSize={50} />
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stock by Category Breakdown */}
                    <Card className="col-span-1 border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col">
                        <CardHeader>
                            <CardTitle>Répartition par catégorie</CardTitle>
                            <CardDescription>Quantité totale de pièces en stock.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[300px] flex items-center justify-center">
                            {categoryData.length === 0 ? (
                                <p className="text-sm text-neutral-500">Pas de stock disponible.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Lower Layout - Recent Movements & Category Stats */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                    {/* Movement Stats Chart */}
                    <Card className="col-span-1 border border-neutral-200/50 dark:border-neutral-800/50 flex flex-col">
                        <CardHeader>
                            <CardTitle>Statistiques des Mouvements</CardTitle>
                            <CardDescription>Répartition des mouvements validés par type.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[250px] flex items-center justify-center">
                            {movementData.length === 0 ? (
                                <p className="text-sm text-neutral-500">Aucun mouvement validé.</p>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={movementData}
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={80}
                                            dataKey="value"
                                        >
                                            {movementData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={MOVEMENT_COLORS[index % MOVEMENT_COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>

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
                                                <div className={`p-2 rounded-lg ${mov.type === 'IN'
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
                                                <Badge className={`text-[10px] mt-1 ${mov.status === 'validated'
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

                </div>
            </div>

            <DashboardReport 
                ref={reportRef}
                stats={stats}
                warehouses_occupancy={warehouses_occupancy}
                recent_movements={recent_movements}
                low_stock_list={low_stock_list}
                categoryData={categoryData}
                movementData={movementData}
                formatCurrency={formatCurrency}
            />
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
