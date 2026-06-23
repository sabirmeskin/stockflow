import { useEffect, useState, useCallback } from 'react';
import { router, usePage } from '@inertiajs/react';
import {
    Bell,
    Package,
    AlertTriangle,
    AlertOctagon,
    CheckCircle2,
    XCircle,
    CheckCheck,
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import echo from '@/lib/echo';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    data: Record<string, unknown>;
    created_at: string;
    created_at_iso: string;
}

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
    mouvement_created: {
        icon: Package,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-950/30',
    },
    rupture_stock: {
        icon: AlertOctagon,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
    faible_stock: {
        icon: AlertTriangle,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-950/30',
    },
    mouvement_validated: {
        icon: CheckCircle2,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
    mouvement_rejected: {
        icon: XCircle,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-950/30',
    },
};

function getTypeConfig(type: string) {
    return typeConfig[type] || { icon: Bell, color: 'text-neutral-500', bg: 'bg-neutral-50 dark:bg-neutral-900' };
}

export function NotificationPanel() {
    const { auth, unreadNotificationsCount } = usePage().props as any;
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(unreadNotificationsCount || 0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [hasNewPulse, setHasNewPulse] = useState(false);

    // Sync unread count from server-side shared props
    useEffect(() => {
        setUnreadCount(unreadNotificationsCount || 0);
    }, [unreadNotificationsCount]);

    // Fetch notifications when dropdown opens
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/notifications', {
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unread_count);
            }
        } catch {
            // silently fail
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    // Listen for real-time events via Echo
    useEffect(() => {
        if (!auth?.user?.id) return;

        const channel = echo.private(`App.Models.User.${auth.user.id}`);

        channel.listen('.stock.notification', (event: any) => {
            const data = event.data || event;

            // Show toast notification
            const config = getTypeConfig(data.type);
            const toastType = data.type === 'rupture_stock' ? 'error'
                : data.type === 'faible_stock' ? 'warning'
                : data.type === 'mouvement_rejected' ? 'error'
                : 'success';

            if (toastType === 'error') {
                toast.error(data.title, { description: data.message });
            } else if (toastType === 'warning') {
                toast.warning(data.title, { description: data.message });
            } else {
                toast.success(data.title, { description: data.message });
            }

            // Increment unread count and trigger pulse animation
            setUnreadCount((prev: number) => prev + 1);
            setHasNewPulse(true);
            setTimeout(() => setHasNewPulse(false), 3000);

            // If dropdown is open, refresh list
            if (isOpen) {
                fetchNotifications();
            }

            // Auto-reload Inertia page data for dashboard/sidebar badges
            router.reload();
        });

        return () => {
            echo.leave(`App.Models.User.${auth.user.id}`);
        };
    }, [auth?.user?.id, isOpen, fetchNotifications]);

    // Mark all as read
    const markAllRead = async () => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await fetch('/notifications/mark-read', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            setNotifications([]);
            setUnreadCount(0);
            router.reload();
        } catch {
            toast.error('Erreur lors du marquage des notifications');
        }
    };

    // Mark single notification as read
    const markRead = async (id: string) => {
        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            await fetch(`/notifications/${id}/mark-read`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });
            setNotifications((prev) => prev.filter((n) => n.id !== id));
            setUnreadCount((prev: number) => Math.max(0, prev - 1));
            router.reload();
        } catch {
            toast.error('Erreur lors du marquage de la notification');
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    id="notification-bell"
                    variant="ghost"
                    size="icon"
                    className="relative h-9 w-9 shrink-0"
                >
                    <Bell className="h-[18px] w-[18px] text-muted-foreground transition-colors group-hover:text-foreground" />
                    {unreadCount > 0 && (
                        <span
                            className={`absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white shadow-sm ${
                                hasNewPulse ? 'animate-bounce' : ''
                            }`}
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden p-0"
                sideOffset={8}
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {notifications.length > 0 && (
                        <button
                            onClick={markAllRead}
                            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Tout marquer lu
                        </button>
                    )}
                </div>

                {/* Notification list */}
                <div className="max-h-[400px] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
                                <Bell className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground">Aucune notification</p>
                            <p className="mt-1 text-xs text-muted-foreground/60">Vous êtes à jour !</p>
                        </div>
                    ) : (
                        notifications.map((notification, index) => {
                            const config = getTypeConfig(notification.type);
                            const Icon = config.icon;
                            return (
                                <div key={notification.id}>
                                    <button
                                        onClick={() => markRead(notification.id)}
                                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent/50"
                                    >
                                        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
                                            <Icon className={`h-4 w-4 ${config.color}`} />
                                        </div>
                                        <div className="min-w-0 flex-1 overflow-hidden">
                                            <p className="text-sm font-semibold leading-tight">{notification.title}</p>
                                            <p className="mt-0.5 text-xs leading-snug text-muted-foreground break-words overflow-wrap-anywhere">
                                                {notification.message}
                                            </p>
                                            <p className="mt-1 text-[10px] font-medium text-muted-foreground/60">
                                                {notification.created_at}
                                            </p>
                                        </div>
                                        <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                    </button>
                                    {index < notifications.length - 1 && (
                                        <DropdownMenuSeparator className="my-0" />
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
