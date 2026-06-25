import { Head, router } from '@inertiajs/react';
import { Bell, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

type Props = {
    notifications: {
        data: Array<{
            id: number;
            title: string;
            message: string;
            channel: string;
            status: string;
            sent_at: string | null;
            created_at: string;
        }>;
        total: number;
    };
};

export default function NotificationsIndex({ notifications }: Props) {
    const markRead = (id: number) => {
        router.post(`/notifications/${id}/read`);
    };

    const markAllRead = () => {
        router.post('/notifications/read-all');
    };

    const hasUnread = notifications.data.some(n => n.status === 'pending');

    return (
        <>
            <Head title="Notifications" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Notifications" description="System notifications and alerts" />
                    {hasUnread && (
                        <Button variant="outline" size="sm" onClick={markAllRead}>
                            <CheckCheck className="mr-2 h-4 w-4" /> Mark All Read
                        </Button>
                    )}
                </div>

                <div className="space-y-2">
                    {notifications.data.map(n => (
                        <Card key={n.id} className={n.status === 'pending' ? 'border-l-4 border-l-primary' : ''}>
                            <CardHeader className="py-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <Bell className={`mt-0.5 h-5 w-5 ${n.status === 'pending' ? 'text-primary' : 'text-muted-foreground'}`} />
                                        <div>
                                            <CardTitle className={`text-sm ${n.status === 'pending' ? 'font-semibold' : ''}`}>
                                                {n.title}
                                            </CardTitle>
                                            <p className="text-sm text-muted-foreground">{n.message}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(n.created_at).toLocaleString()}
                                                {n.sent_at && ` · Sent ${new Date(n.sent_at).toLocaleString()}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={n.status === 'pending' ? 'default' : 'secondary'}>{n.status}</Badge>
                                        <Badge variant="outline" className="text-xs">{n.channel}</Badge>
                                        {n.status === 'pending' && (
                                            <Button variant="ghost" size="sm" onClick={() => markRead(n.id)}>
                                                <CheckCheck className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>

                {notifications.data.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">No notifications yet.</p>
                )}
            </div>
        </>
    );
}
