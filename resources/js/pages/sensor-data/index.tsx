import { Head, Link, usePoll } from '@inertiajs/react';
import { LineChart, Thermometer, Droplets, Sun, ToggleLeft, Activity, Zap, Circle, WifiOff } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

const typeIcons: Record<string, any> = {
    temperature: Thermometer,
    humidity: Droplets,
    moisture: Droplets,
    light: Sun,
    illuminance: Sun,
    ec: Droplets,
    ph: Zap,
    tds: Droplets,
    switch: ToggleLeft,
    select: Activity,
    button: Zap,
    binary_sensor: Circle,
    number: LineChart,
};

type Props = {
    entities: Array<{
        id: number;
        entity_id: string;
        name: string;
        entity_type: string;
        unit: string | null;
        device_class: string | null;
        latest_state: { value: string; recorded_at: string } | null;
        device: { id: number; name: string; status: string; last_seen: string | null; zone: { name: string; farm: { name: string } } | null };
    }>;
};

export default function SensorDataIndex({ entities }: Props) {
    usePoll(5000, { only: ['entities'] });

    const grouped = entities.reduce((acc: Record<string, any[]>, e) => {
        const dc = e.device_class ?? e.entity_type ?? 'other';
        if (!acc[dc]) acc[dc] = [];
        acc[dc].push(e);
        return acc;
    }, {});

    return (
        <>
            <Head title="Sensor Data" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <Heading title="Sensor Data" description="Live sensor readings from your devices" />

                {Object.entries(grouped).map(([deviceClass, ents]) => (
                    <div key={deviceClass}>
                        <h3 className="mb-2 text-sm font-medium capitalize text-muted-foreground">{deviceClass}</h3>
                        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {ents.map(entity => {
                                const Icon = typeIcons[entity.device_class ?? ''] ?? typeIcons[entity.entity_type] ?? LineChart;
                                const isOffline = entity.device.status === 'offline' || entity.device.status === 'disconnected';
                                const staleLabel = entity.latest_state?.recorded_at
                                    ? formatStale(entity.latest_state.recorded_at)
                                    : null;

                                return (
                                    <Link key={entity.id} href={`/sensor-data/${entity.id}`}>
                                        <Card className={`cursor-pointer transition-colors hover:bg-accent/50 ${isOffline ? 'opacity-60' : ''}`}>
                                            <CardHeader className="pb-2">
                                                <CardTitle className="flex items-center justify-between text-sm">
                                                    <span className="flex items-center gap-2">
                                                        <Icon className="h-4 w-4 text-primary" />
                                                        {entity.name}
                                                    </span>
                                                    {isOffline && (
                                                        <Badge variant="outline" className="text-xs gap-1 text-orange-500 border-orange-500/30">
                                                            <WifiOff className="h-3 w-3" /> stale
                                                        </Badge>
                                                    )}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {entity.latest_state ? (
                                                    <>
                                                        <p className="text-2xl font-bold">
                                                            {entity.latest_state.value}
                                                            {entity.unit && <span className="text-sm font-normal text-muted-foreground"> {entity.unit}</span>}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {new Date(entity.latest_state.recorded_at).toLocaleString()}
                                                            {staleLabel && <span className="ml-1 text-orange-500">({staleLabel})</span>}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No data</p>
                                                )}
                                                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                                                    <span className={`h-1.5 w-1.5 rounded-full ${isOffline ? 'bg-orange-500' : 'bg-green-500'}`} />
                                                    {entity.device.name}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {entities.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                        No sensor entities found. Connect an ESPHome device to see sensor data.
                    </p>
                )}
            </div>
        </>
    );
}

function formatStale(recordedAt: string): string {
    const diff = Date.now() - new Date(recordedAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}
