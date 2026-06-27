import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, ChevronDown, ChevronUp, Cpu, Sprout } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
} from 'recharts';

type ZoneDevice = {
    id: number;
    name: string;
    status: string;
    entities: Array<{
        id: number;
        entity_id: string;
        name: string;
        entity_type: string;
        unit: string | null;
        latest_state: { value: string; recorded_at: string } | null;
    }>;
};

type Zone = {
    id: number;
    name: string;
    type: string | null;
    capacity: number | null;
    description: string | null;
    hidden_entity_ids: number[] | null;
    graph_entity_ids: number[] | null;
    devices: ZoneDevice[];
    crop_cycles: Array<{ id: number }>;
};

type Props = {
    zone: Zone;
    farmId: number;
    onEdit: (zone: Zone) => void;
};

type HistoryPoint = {
    recorded_at: string;
    value: string;
};

const COLORS = ['#2563eb', '#16a34a', '#ea580c', '#9333ea', '#dc2626', '#0891b2'];

export default function ZoneCard({ zone, farmId, onEdit }: Props) {
    const [graphOpen, setGraphOpen] = useState(false);
    const [graphData, setGraphData] = useState<Record<number, HistoryPoint[]>>({});

    const allEntities = zone.devices.flatMap(d =>
        d.entities.map(e => ({ ...e, deviceName: d.name, deviceStatus: d.status }))
    );

    const hiddenIds = zone.hidden_entity_ids ?? [];
    const graphIds = zone.graph_entity_ids ?? [];
    const visibleEntities = allEntities.filter(e => !hiddenIds.includes(e.id));
    const graphEntities = allEntities.filter(e => graphIds.includes(e.id));

    const fetchGraphData = useCallback(async () => {
        if (graphIds.length === 0) {
            setGraphData({});
            return;
        }
        try {
            const res = await fetch(`/farms/${farmId}/zones/${zone.id}/entity-history?range=24h&limit=200`);
            if (res.ok) {
                setGraphData(await res.json());
            }
        } catch {
            // silent
        }
    }, [farmId, zone.id, graphIds.length]);

    useEffect(() => {
        if (graphOpen && graphIds.length > 0) {
            fetchGraphData();
            const interval = setInterval(fetchGraphData, 10000);
            return () => clearInterval(interval);
        }
    }, [graphOpen, fetchGraphData]);

    const buildChartData = (entityId: number) => {
        const points = graphData[entityId] ?? [];
        return points.map(p => ({
            time: new Date(p.recorded_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            value: parseFloat(p.value) || 0,
        }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-lg">
                    <span>{zone.name}</span>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(zone)}>
                        <Pencil className="h-3 w-3" />
                    </Button>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Type: {zone.type ?? 'General'}</p>
                    <p className="flex items-center gap-1">
                        <Cpu className="h-3 w-3" /> Devices: {zone.devices?.length ?? 0}
                    </p>
                    <p className="flex items-center gap-1">
                        <Sprout className="h-3 w-3" /> Plants: {zone.crop_cycles?.length ?? 0}
                        {zone.capacity !== null && <span className="text-xs">/ {zone.capacity} max</span>}
                    </p>
                    {zone.capacity !== null && (
                        <div className="mt-2">
                            <div className="flex items-center justify-between text-xs">
                                <span>Capacity</span>
                                <span>{(zone.crop_cycles?.length ?? 0)} / {zone.capacity}</span>
                            </div>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${Math.min(100, ((zone.crop_cycles?.length ?? 0) / zone.capacity) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}
                    {zone.description && (
                        <p className="mt-2 text-xs">{zone.description}</p>
                    )}
                </div>

                {visibleEntities.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                        <div className="space-y-1.5">
                            {visibleEntities.slice(0, 6).map(entity => (
                                <div key={entity.id} className="flex items-center justify-between text-xs">
                                    <span className="flex items-center gap-1 truncate">
                                        <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${entity.deviceStatus === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                        <span className="truncate">{entity.name}</span>
                                    </span>
                                    {entity.latest_state ? (
                                        <span className="font-medium tabular-nums shrink-0">
                                            {entity.latest_state.value}
                                            {entity.unit && <span className="text-muted-foreground ml-0.5">{entity.unit}</span>}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">--</span>
                                    )}
                                </div>
                            ))}
                            {visibleEntities.length > 6 && (
                                <p className="text-xs text-muted-foreground">
                                    +{visibleEntities.length - 6} more entities
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {graphEntities.length > 0 && (
                    <div className="mt-3 border-t pt-3">
                        <Collapsible open={graphOpen} onOpenChange={setGraphOpen}>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-full justify-between text-xs text-muted-foreground">
                                    <span>Graph ({graphEntities.length} entities)</span>
                                    {graphOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 space-y-3">
                                {graphEntities.map((entity, i) => {
                                    const chartData = buildChartData(entity.id);
                                    if (chartData.length === 0) return null;
                                    return (
                                        <div key={entity.id}>
                                            <p className="mb-1 text-[10px] font-medium text-muted-foreground">
                                                {entity.name}
                                                {entity.unit && <span className="ml-1">({entity.unit})</span>}
                                            </p>
                                            <div className="h-32">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <LineChart data={chartData}>
                                                        <XAxis dataKey="time" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                                                        <YAxis tick={{ fontSize: 9 }} width={35} />
                                                        <Tooltip />
                                                        <Line
                                                            type="monotone"
                                                            dataKey="value"
                                                            stroke={COLORS[i % COLORS.length]}
                                                            dot={false}
                                                            strokeWidth={1.5}
                                                        />
                                                    </LineChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </div>
                                    );
                                })}
                            </CollapsibleContent>
                        </Collapsible>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
