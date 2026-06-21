import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Warehouse, 
    Boxes, 
    RefreshCw, 
    Users, 
    Settings, 
    ClipboardList,
    BookOpen,
    CheckSquare,
    ShieldCheck
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';

export function AppSidebar() {
    const { auth, pendingMovementsCount } = usePage().props as any;
    const user = auth?.user;

    const hasPermission = (perm: string) => {
        if (!user || !user.permissions) return false;
        return user.permissions.includes(perm);
    };

    const mainNavItems = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
            show: hasPermission('view_dashboard'),
        },
        {
            title: 'Entrepôts',
            href: '/warehouses',
            icon: Warehouse,
            show: hasPermission('read_warehouses'),
        },
        {
            title: 'Articles & Stock',
            href: '/items',
            icon: Boxes,
            show: hasPermission('read_items'),
        },
        {
            title: 'Mouvements Stock',
            href: '/movements',
            icon: RefreshCw,
            show: hasPermission('manage_movements') || hasPermission('validate_movements'),
        },
        {
            title: 'Approbations',
            href: '/validations',
            icon: CheckSquare,
            show: hasPermission('validate_movements'),
            badge: pendingMovementsCount || 0,
        },
        {
            title: 'Utilisateurs',
            href: '/users',
            icon: Users,
            show: hasPermission('manage_users'),
        },
        {
            title: 'Habilitations',
            href: '/roles',
            icon: ShieldCheck,
            show: hasPermission('manage_users'),
        },
        {
            title: 'Journal d\'Audit',
            href: '/audit-logs',
            icon: ClipboardList,
            show: hasPermission('read_audit_logs'),
        },
        {
            title: 'Configuration',
            href: '/settings/system',
            icon: Settings,
            show: hasPermission('configure_system'),
        },
    ].filter(item => item.show);

    const footerNavItems: any[] = [];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
