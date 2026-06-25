import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Heading from '@/components/heading';

type Props = {
    entity: {
        id: number;
        entity_id: string;
        name: string;
        entity_type: string;
        unit: string | null;
        device_class: string | null;
        icon: string | null;
        device: { id: number; name: string; zone: { name: string; farm: { name: string } } | null };
    };
    states: Array<{
        id: number;
        value: string;
        recorded_at: string;
        attributes: Record<string, any> | null;
    }>;
};

function SimpleChart({ states, unit }: { states: Props['states']; unit: string | null }) {
    if (states.length < 2) return null;
    const values = states.map(s => parseFloat(s.value)).filter(v => !isNaN(v));
    if (values.length < 2) return null;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    const width = 600;
    const height = 200;
    const points = states
        .map((s, i) => {
            const v = parseFloat(s.value);
            if (isNaN(v)) return null;
            const x = (i / (states.length - 1)) * width;
            const y = height - ((v - min) / range) * (height - 20) - 10;
            return `${x},${y}`;
        })
        .filter(Boolean)
        .join(' ');

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-3xl">
            <polyline fill="none" stroke="hsl(142.1 76.2% 36.3%)" strokeWidth="2" points={points} />
            {states.filter((_, i) => i % Math.max(1, Math.floor(states.length / 5)) === 0).map((s, i) => {
                const v = parseFloat(s.value);
                if (isNaN(v)) return null;
                const idx = states.indexOf(s);
                const x = (idx / (states.length - 1)) * width;
                return (
                    <g key={s.id}>
                        <text x={x} y={height - 2} textAnchor="middle" className="fill-muted-foreground" fontSize="10">
                            {new Date(s.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function SensorDataShow({ entity, states }: Props) {
    const latest = states[states.length - 1];
    const numeric = states.map(s => parseFloat(s.value)).filter(v => !isNaN(v));

    return (
        <>
            <Head title={entity.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/sensor-data">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <Heading title={entity.name} description={`${entity.entity_id} - ${entity.device.name}`} />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Current Value</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold">
                                {latest?.value ?? '--'}
                                {entity.unit && <span className="text-lg font-normal text-muted-foreground"> {entity.unit}</span>}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Min</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">
                                {numeric.length > 0 ? Math.min(...numeric).toFixed(1) : '--'}
                                {entity.unit && <span className="text-sm text-muted-foreground"> {entity.unit}</span>}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Max</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">
                                {numeric.length > 0 ? Math.max(...numeric).toFixed(1) : '--'}
                                {entity.unit && <span className="text-sm text-muted-foreground"> {entity.unit}</span>}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Average</CardTitle></CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">
                                {numeric.length > 0 ? (numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(1) : '--'}
                                {entity.unit && <span className="text-sm text-muted-foreground"> {entity.unit}</span>}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-sm">
                            <LineChart className="h-4 w-4" /> History ({states.length} data points)
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {states.length >= 2 ? (
                            <SimpleChart states={states} unit={entity.unit} />
                        ) : (
                            <p className="py-8 text-center text-muted-foreground">
                                Not enough data points to display chart.
                            </p>
                        )}
                    </CardContent>
                </Card>

                {states.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Recent Readings</CardTitle></CardHeader>
                        <CardContent>
                            <div className="max-h-60 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-left text-muted-foreground">
                                            <th className="pb-2 pr-4">Time</th>
                                            <th className="pb-2">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...states].reverse().slice(0, 50).map(s => (
                                            <tr key={s.id} className="border-t border-border/50">
                                                <td className="py-1 pr-4 text-muted-foreground">{new Date(s.recorded_at).toLocaleString()}</td>
                                                <td className="py-1 font-medium">{s.value}{entity.unit && <span className="text-muted-foreground"> {entity.unit}</span>}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

SensorDataShow.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Sensor Data', href: '/sensor-data' },
        { title: props.entity?.name ?? 'Sensor', href: `/sensor-data/${props.entity?.id}` },
    ],
});
