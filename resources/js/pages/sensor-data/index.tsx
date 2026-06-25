import { Head, Link } from '@inertiajs/react';
import { LineChart, Thermometer, Droplets, Sun } from 'lucide-react';
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
    ec: Droplets,
    ph: Droplets,
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
        device: { id: number; name: string; zone: { name: string; farm: { name: string } } | null };
    }>;
};

export default function SensorDataIndex({ entities }: Props) {
    const grouped = entities.reduce((acc: Record<string, any[]>, e) => {
        const dc = e.device_class ?? 'other';
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
                                const Icon = typeIcons[deviceClass] ?? LineChart;
                                return (
                                    <Link key={entity.id} href={`/sensor-data/${entity.id}`}>
                                        <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                                            <CardHeader className="pb-2">
                                                <CardTitle className="flex items-center gap-2 text-sm">
                                                    <Icon className="h-4 w-4 text-primary" />
                                                    {entity.name}
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
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-muted-foreground">No data</p>
                                                )}
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {entity.device.name}
                                                </p>
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
