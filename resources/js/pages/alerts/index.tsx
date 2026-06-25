import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, AlertTriangle, Info, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

const severityIcons: Record<string, any> = {
    info: Info, warning: AlertTriangle, critical: AlertCircle, emergency: AlertCircle,
};
const severityColors: Record<string, string> = {
    info: 'bg-blue-100 text-blue-800', warning: 'bg-yellow-100 text-yellow-800',
    critical: 'bg-orange-100 text-orange-800', emergency: 'bg-red-100 text-red-800',
};

type Props = {
    alerts: Array<{
        id: number;
        message: string;
        status: string;
        triggered_at: string;
        resolved_at: string | null;
        alert_rule: {
            name: string;
            severity: string;
            entity: { id: number; name: string; device: { name: string } };
        } | null;
        entity_state: { value: string; recorded_at: string } | null;
    }>;
};

export default function AlertsIndex({ alerts }: Props) {
    const resolve = (id: number) => {
        router.post(`/alerts/${id}/resolve`);
    };

    const activeAlerts = alerts.filter(a => a.status === 'triggered');
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved');

    return (
        <>
            <Head title="Alerts" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Alerts" description="Active and resolved alerts" />
                    <Link href="/alert-rules">
                        <Button variant="outline">Manage Rules</Button>
                    </Link>
                </div>

                {activeAlerts.length > 0 && (
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Active ({activeAlerts.length})</h3>
                        <div className="space-y-2">
                            {activeAlerts.map(alert => {
                                const SeverityIcon = severityIcons[alert.alert_rule?.severity ?? 'warning'] ?? AlertTriangle;
                                return (
                                    <Card key={alert.id} className="border-l-4 border-l-red-500">
                                        <CardHeader className="py-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-start gap-3">
                                                    <SeverityIcon className="mt-0.5 h-5 w-5 text-red-500" />
                                                    <div>
                                                        <CardTitle className="text-sm">{alert.alert_rule?.name ?? 'Alert'}</CardTitle>
                                                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {alert.alert_rule?.entity?.name} · {alert.alert_rule?.entity?.device?.name}
                                                            {alert.entity_state && ` · Value: ${alert.entity_state.value}`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Badge className={severityColors[alert.alert_rule?.severity ?? 'warning']}>
                                                        {alert.alert_rule?.severity ?? 'warning'}
                                                    </Badge>
                                                    <Button variant="ghost" size="sm" onClick={() => resolve(alert.id)}>
                                                        <CheckCircle2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {resolvedAlerts.length > 0 && (
                    <div>
                        <h3 className="mb-2 text-sm font-medium text-muted-foreground">Resolved ({resolvedAlerts.length})</h3>
                        <div className="space-y-1">
                            {resolvedAlerts.map(alert => (
                                <Card key={alert.id} className="opacity-60">
                                    <CardHeader className="py-2">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm">{alert.message}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {new Date(alert.triggered_at).toLocaleString()}
                                                    {alert.resolved_at && ` · Resolved ${new Date(alert.resolved_at).toLocaleString()}`}
                                                </p>
                                            </div>
                                            <Badge variant="outline">resolved</Badge>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {alerts.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">No alerts yet.</p>
                )}
            </div>
        </>
    );
}
