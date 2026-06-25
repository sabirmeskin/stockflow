import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ClipboardList, Search, User, Globe, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface LogData {
    id: number;
    user_name: string;
    user_email: string;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
}

import { useEffect } from 'react';
import { router } from '@inertiajs/react';

interface LogData {
    id: number;
    user_name: string;
    user_email: string;
    action: string;
    description: string;
    ip_address: string | null;
    created_at: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginatedLogs {
    data: LogData[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
}

interface Props {
    logs: PaginatedLogs;
    filters: {
        search: string;
    };
}

export default function AuditLogsIndex({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');

    // Debounced search
    useEffect(() => {
        if (search === (filters.search || '')) return;

        const timer = setTimeout(() => {
            router.get('/audit-logs', {
                search: search,
            }, {
                preserveState: true,
                replace: true,
            });
        }, 350);

        return () => clearTimeout(timer);
    }, [search]);

    const filteredLogs = logs.data;

    const getActionBadge = (action: string) => {
        if (action.includes('CREATE')) {
            return <Badge className="bg-emerald-100 text-emerald-800 border-0 dark:bg-emerald-950/30 dark:text-emerald-400 font-mono text-xs">{action}</Badge>;
        } else if (action.includes('DELETE') || action.includes('REJECT')) {
            return <Badge className="bg-rose-100 text-rose-800 border-0 dark:bg-rose-950/30 dark:text-rose-400 font-mono text-xs">{action}</Badge>;
        } else if (action.includes('UPDATE') || action.includes('VALIDATE')) {
            return <Badge className="bg-blue-100 text-blue-800 border-0 dark:bg-blue-950/30 dark:text-blue-400 font-mono text-xs">{action}</Badge>;
        } else {
            return <Badge variant="outline" className="font-mono text-xs">{action}</Badge>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <>
            <Head title="Journal d'audit" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                
                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                        <ClipboardList className="h-6 w-6 text-indigo-500" /> Journal d'Audit
                    </h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Consultez l'historique complet des actions effectuées par les utilisateurs sur la plateforme.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
                    <Input 
                        placeholder="Rechercher par action, description, utilisateur ou email..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="pl-9"
                    />
                </div>

                {/* Audit Logs Table */}
                <div className="rounded-xl border border-neutral-200/50 bg-white dark:border-neutral-800 dark:bg-neutral-900/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="border-b border-neutral-100 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-900/30 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                    <th className="p-4 w-[80px]">ID</th>
                                    <th className="p-4 w-[200px]">Date & Heure</th>
                                    <th className="p-4">Utilisateur</th>
                                    <th className="p-4">Action</th>
                                    <th className="p-4">Description</th>
                                    <th className="p-4 w-[130px]">Adresse IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredLogs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-neutral-500">
                                            Aucun log d'activité disponible.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredLogs.map(log => (
                                        <tr key={log.id} className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50/10 transition-colors">
                                            <td className="p-4 font-mono text-xs text-neutral-400">#{log.id}</td>
                                            <td className="p-4 text-xs text-neutral-500">{formatDate(log.created_at)}</td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="font-semibold flex items-center gap-1">
                                                        <User className="h-3 w-3 text-neutral-400" />
                                                        {log.user_name}
                                                    </span>
                                                    <span className="text-[10px] text-neutral-400">{log.user_email}</span>
                                                </div>
                                            </td>
                                            <td className="p-4">{getActionBadge(log.action)}</td>
                                            <td className="p-4 font-medium text-neutral-700 dark:text-neutral-300">{log.description}</td>
                                            <td className="p-4 text-xs text-neutral-500 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <Globe className="h-3 w-3 text-neutral-400" />
                                                    {log.ip_address || 'N/A'}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Pagination Controls */}
                    {logs.last_page > 1 && (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-t border-neutral-200 dark:border-neutral-800 p-4 bg-neutral-50/50 dark:bg-neutral-900/50">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                Affichage de <span className="font-semibold text-neutral-700 dark:text-neutral-200">{logs.from || 0}</span> à <span className="font-semibold text-neutral-700 dark:text-neutral-200">{logs.to || 0}</span> sur <span className="font-semibold text-neutral-700 dark:text-neutral-200">{logs.total}</span> logs
                            </p>
                            <div className="flex items-center gap-1 flex-wrap">
                                {logs.links.map((link, idx) => {
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

            </div>
        </>
    );
}

AuditLogsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Journal d\'Audit',
            href: '/audit-logs',
        },
    ],
};
