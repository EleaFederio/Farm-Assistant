import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import PendingInvitationsModal from '@/components/pending-invitations-modal';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tractor, Sprout, ListChecks, Bell, CalendarDays } from 'lucide-react';
import { dashboard, dashboardTeam } from '@/routes';
import type { DashboardInvitation } from '@/types';

type Props = {
    pendingInvitations?: DashboardInvitation[];
    stats?: {
        farms: number;
        activeCycles: number;
        pendingTasks: number;
        activeAlerts: number;
        unreadNotifications: number;
    };
    upcomingHarvests?: Array<{
        id: number;
        name: string;
        expected_harvest_date: string;
        status: string;
        crop: { name: string };
        zone: { name: string };
    }>;
};

export default function Dashboard({ pendingInvitations = [], stats = { farms: 0, activeCycles: 0, pendingTasks: 0, activeAlerts: 0, unreadNotifications: 0 }, upcomingHarvests = [] }: Props) {
    const [showInvitations, setShowInvitations] = useState(
        pendingInvitations.length > 0,
    );

    const statCards = [
        { label: 'Farms', value: stats.farms, icon: Tractor, href: '/farms', color: 'text-blue-500' },
        { label: 'Active Cycles', value: stats.activeCycles, icon: Sprout, href: '/crop-cycles', color: 'text-green-500' },
        { label: 'Pending Tasks', value: stats.pendingTasks, icon: ListChecks, href: '/tasks', color: 'text-orange-500' },
        { label: 'Active Alerts', value: stats.activeAlerts, icon: Bell, href: '/alerts', color: 'text-red-500' },
    ];

    return (
        <>
            <Head title="Dashboard" />
            <PendingInvitationsModal
                invitations={pendingInvitations}
                open={pendingInvitations.length > 0 && showInvitations}
                onOpenChange={setShowInvitations}
            />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-4">
                    {statCards.map(card => (
                        <Link key={card.label} href={card.href}>
                            <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {card.label}
                                    </CardTitle>
                                    <card.icon className={`h-4 w-4 ${card.color}`} />
                                </CardHeader>
                                <CardContent>
                                    <p className="text-2xl font-bold">{card.value}</p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <CalendarDays className="h-4 w-4" /> Upcoming Harvests
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {upcomingHarvests.length > 0 ? (
                                <div className="space-y-2">
                                    {upcomingHarvests.map(h => (
                                        <Link key={h.id} href={`/crop-cycles/${h.id}`}>
                                            <div className="flex items-center justify-between rounded-lg border p-2 transition-colors hover:bg-accent/50">
                                                <div>
                                                    <p className="text-sm font-medium">{h.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {h.crop.name} · {h.zone.name}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold">{h.expected_harvest_date}</p>
                                                    <Badge variant="outline" className="text-xs">{h.status}</Badge>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    No upcoming harvests
                                </p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm">
                                <Bell className="h-4 w-4" /> Unread Notifications
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {stats.unreadNotifications > 0 ? (
                                <Link href="/notifications">
                                    <p className="text-center text-sm text-muted-foreground hover:underline">
                                        You have {stats.unreadNotifications} unread notification{stats.unreadNotifications !== 1 ? 's' : ''}
                                    </p>
                                </Link>
                            ) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">
                                    All caught up!
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

Dashboard.layout = (props: { currentTeam?: { slug: string } | null }) => ({
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: props.currentTeam ? dashboardTeam(props.currentTeam.slug) : '/dashboard',
        },
    ],
});
