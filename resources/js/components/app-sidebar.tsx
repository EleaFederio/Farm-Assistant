import { Link, usePage } from '@inertiajs/react';
import {
    Sprout,
    LayoutGrid,
    Tractor,
    Cpu,
    Bell,
    CalendarDays,
    ListChecks,
    ClipboardList,
    FlaskConical,
    LineChart,
    BookOpen,
    FolderGit2,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

export function AppSidebar() {
    const page = usePage();

    const user = page.props.auth?.user;

    const mainNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Farms',
            href: '/farms',
            icon: Tractor,
        },
        {
            title: 'Crops',
            href: '/crops',
            icon: Sprout,
        },
        {
            title: 'Crop Cycles',
            href: '/crop-cycles',
            icon: ClipboardList,
        },
        {
            title: 'Devices',
            href: '/devices',
            icon: Cpu,
        },
        {
            title: 'Sensor Data',
            href: '/sensor-data',
            icon: LineChart,
        },
        {
            title: 'Hydroponics',
            href: '/hydroponics',
            icon: FlaskConical,
        },
        {
            title: 'Tasks',
            href: '/tasks',
            icon: ListChecks,
        },
        {
            title: 'Calendar',
            href: '/calendar',
            icon: CalendarDays,
        },
        {
            title: 'Alerts',
            href: '/alerts',
            icon: Bell,
        },
    ];

    const footerNavItems: NavItem[] = [
        {
            title: 'Notifications',
            href: '/notifications',
            icon: FolderGit2,
        },
        {
            title: 'Documentation',
            href: 'https://esphome.io',
            icon: BookOpen,
        },
    ];

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
                <SidebarMenu>
                    <SidebarMenuItem>
                        <TeamSwitcher />
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
