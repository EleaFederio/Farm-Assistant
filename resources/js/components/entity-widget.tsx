import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Thermometer,
    Droplets,
    Sun,
    Sprout,
    Zap,
    Activity,
    ToggleLeft,
    ToggleRight,
    Circle,
    Gauge,
} from 'lucide-react';

type Entity = {
    id: number;
    entity_id: string;
    name: string;
    entity_type: string;
    unit: string | null;
    device_class: string | null;
    enabled: boolean;
    latest_state: { value: string; recorded_at: string; attributes: Record<string, unknown> | null } | null;
    attributes: Record<string, unknown> | null;
};

const deviceClassColors: Record<string, string> = {
    temperature: 'text-orange-500',
    humidity: 'text-blue-500',
    moisture: 'text-green-500',
    light: 'text-yellow-500',
    illuminance: 'text-yellow-500',
    pressure: 'text-purple-500',
    co2: 'text-gray-500',
    ph: 'text-emerald-500',
    tds: 'text-cyan-500',
    default: 'text-muted-foreground',
};

const deviceClassBg: Record<string, string> = {
    temperature: 'bg-orange-500/10',
    humidity: 'bg-blue-500/10',
    moisture: 'bg-green-500/10',
    light: 'bg-yellow-500/10',
    illuminance: 'bg-yellow-500/10',
    pressure: 'bg-purple-500/10',
    co2: 'bg-gray-500/10',
    ph: 'bg-emerald-500/10',
    tds: 'bg-cyan-500/10',
    default: 'bg-muted',
};

function getColor(entity: Entity): string {
    return deviceClassColors[entity.device_class ?? ''] ?? deviceClassColors.default;
}

function getBg(entity: Entity): string {
    return deviceClassBg[entity.device_class ?? ''] ?? deviceClassBg.default;
}

function getIcon(entity: Entity) {
    const cls = entity.device_class ?? '';
    switch (cls) {
        case 'temperature':
            return <Thermometer className="h-5 w-5" />;
        case 'humidity':
            return <Droplets className="h-5 w-5" />;
        case 'light':
        case 'illuminance':
            return <Sun className="h-5 w-5" />;
        case 'moisture':
            return <Sprout className="h-5 w-5" />;
        case 'ph':
            return <Zap className="h-5 w-5" />;
        default:
            switch (entity.entity_type) {
                case 'switch':
                    return entity.latest_state?.value === 'ON' || entity.latest_state?.value === 'true'
                        ? <ToggleRight className="h-5 w-5" />
                        : <ToggleLeft className="h-5 w-5" />;
                case 'binary_sensor':
                    return <Circle className="h-5 w-5" />;
                case 'select':
                    return <Activity className="h-5 w-5" />;
                default:
                    return <Gauge className="h-5 w-5" />;
            }
    }
}

function formatValue(value: string | null | undefined, unit: string | null): string {
    if (value === null || value === undefined) return '--';
    const num = parseFloat(value);
    if (!isNaN(num)) {
        return num % 1 === 0 ? num.toString() : num.toFixed(1);
    }
    return value;
}

function sendCommand(entity: Entity, value: string) {
    fetch(`/api/entities/${entity.id}/command`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'X-XSRF-TOKEN': decodeURIComponent(
                document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''
            ),
        },
        body: JSON.stringify({ value }),
    })
        .then(async (res) => {
            const data = await res.json();
            if (res.ok) {
                toast.success(`${entity.name}`, { description: `Set to ${value}` });
            } else {
                toast.error(`${entity.name}`, { description: data.error ?? 'Command failed' });
            }
        })
        .catch(() => {
            toast.error(`${entity.name}`, { description: 'Device unreachable' });
        });
}

function SwitchWidget({ entity }: { entity: Entity }) {
    const isOn = entity.latest_state?.value === 'ON' || entity.latest_state?.value === 'true';
    const [optimistic, setOptimistic] = useState(isOn);

    const handleChange = (checked: boolean) => {
        const newValue = checked ? 'ON' : 'OFF';
        setOptimistic(checked);
        sendCommand(entity, newValue);
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">switch</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground truncate">{entity.entity_id}</p>
                    <Switch
                        checked={optimistic}
                        onCheckedChange={handleChange}
                        disabled={!entity.enabled}
                    />
                </div>
                <div className="mt-2 flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${optimistic ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <span className="text-sm font-medium">{optimistic ? 'ON' : 'OFF'}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function SensorWidget({ entity }: { entity: Entity }) {
    const value = entity.latest_state?.value ?? null;
    const numVal = value !== null ? parseFloat(value) : null;
    const color = getColor(entity);
    const bg = getBg(entity);

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">sensor</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <div className={`rounded-lg p-4 ${bg}`}>
                    <div className="flex items-baseline gap-1">
                        <span className={`text-3xl font-bold tabular-nums ${color}`}>
                            {formatValue(value, entity.unit)}
                        </span>
                        {entity.unit && (
                            <span className="text-sm text-muted-foreground">{entity.unit}</span>
                        )}
                    </div>
                    {numVal !== null && !isNaN(numVal) && entity.device_class === 'temperature' && (
                        <MiniGauge value={numVal} min={0} max={50} color={color} />
                    )}
                    {numVal !== null && !isNaN(numVal) && entity.device_class === 'humidity' && (
                        <MiniGauge value={numVal} min={0} max={100} color={color} />
                    )}
                    {numVal !== null && !isNaN(numVal) && entity.device_class === 'ph' && (
                        <MiniGauge value={numVal} min={0} max={14} color={color} />
                    )}
                </div>
                {entity.latest_state?.recorded_at && (
                    <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(entity.latest_state.recorded_at).toLocaleTimeString()}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}

function MiniGauge({ value, min, max, color }: { value: number; min: number; max: number; color: string }) {
    const pct = Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));

    return (
        <div className="mt-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

function SelectWidget({ entity }: { entity: Entity }) {
    const value = entity.latest_state?.value ?? '';
    const attributes = (entity.attributes ?? entity.latest_state?.attributes) as Record<string, unknown> | null;
    const options = (attributes?.option as string[]) ?? [];

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">select</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <Select
                    value={value}
                    onValueChange={(v) => sendCommand(entity, v)}
                    disabled={!entity.enabled}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </CardContent>
        </Card>
    );
}

function NumberWidget({ entity }: { entity: Entity }) {
    const value = entity.latest_state?.value ?? '';
    const numVal = parseFloat(value);
    const [input, setInput] = useState(isNaN(numVal) ? '' : numVal.toString());

    const handleSubmit = () => {
        if (input !== '' && !isNaN(parseFloat(input))) {
            sendCommand(entity, input);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">number</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                            const v = (parseFloat(input) || 0) - 1;
                            setInput(v.toString());
                            sendCommand(entity, v.toString());
                        }}
                        disabled={!entity.enabled}
                    >
                        -
                    </Button>
                    <Input
                        type="number"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onBlur={handleSubmit}
                        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        className="text-center"
                        disabled={!entity.enabled}
                    />
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        onClick={() => {
                            const v = (parseFloat(input) || 0) + 1;
                            setInput(v.toString());
                            sendCommand(entity, v.toString());
                        }}
                        disabled={!entity.enabled}
                    >
                        +
                    </Button>
                </div>
                {entity.unit && (
                    <p className="mt-1 text-xs text-muted-foreground text-center">{entity.unit}</p>
                )}
            </CardContent>
        </Card>
    );
}

function BinarySensorWidget({ entity }: { entity: Entity }) {
    const isOn = entity.latest_state?.value === 'ON' || entity.latest_state?.value === 'true';

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">binary_sensor</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <div className="flex items-center gap-3">
                    <div className={`h-4 w-4 rounded-full ${isOn ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-400'}`} />
                    <span className="text-lg font-semibold">{isOn ? 'ON' : 'OFF'}</span>
                </div>
            </CardContent>
        </Card>
    );
}

function ButtonWidget({ entity }: { entity: Entity }) {
    const [pressing, setPressing] = useState(false);

    const handlePress = () => {
        setPressing(true);
        sendCommand(entity, 'PRESS');
        setTimeout(() => setPressing(false), 500);
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">button</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <Button
                    onClick={handlePress}
                    disabled={!entity.enabled || pressing}
                    className="w-full"
                    variant={pressing ? 'secondary' : 'default'}
                >
                    {pressing ? 'Pressing...' : 'Press'}
                </Button>
            </CardContent>
        </Card>
    );
}

function LightWidget({ entity }: { entity: Entity }) {
    const isOn = entity.latest_state?.value === 'ON' || entity.latest_state?.value === 'true';
    const attributes = (entity.attributes ?? entity.latest_state?.attributes) as Record<string, unknown> | null;
    const brightness = (attributes?.brightness as number) ?? (isOn ? 100 : 0);
    const [optimistic, setOptimistic] = useState(isOn);

    const handleChange = (checked: boolean) => {
        setOptimistic(checked);
        sendCommand(entity, checked ? 'ON' : 'OFF');
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">light</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Sun className={`h-5 w-5 ${optimistic ? 'text-yellow-500' : 'text-gray-400'}`} />
                        <span className="text-sm font-medium">{optimistic ? 'ON' : 'OFF'}</span>
                    </div>
                    <Switch
                        checked={optimistic}
                        onCheckedChange={handleChange}
                        disabled={!entity.enabled}
                    />
                </div>
                {optimistic && (
                    <div className="mt-1">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                            <span>Brightness</span>
                            <span>{brightness}%</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                            <div
                                className="h-full rounded-full bg-yellow-500 transition-all duration-300"
                                style={{ width: `${brightness}%` }}
                            />
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

function FanWidget({ entity }: { entity: Entity }) {
    const isOn = entity.latest_state?.value === 'ON' || entity.latest_state?.value === 'true';
    const [optimistic, setOptimistic] = useState(isOn);

    const handleChange = (checked: boolean) => {
        setOptimistic(checked);
        sendCommand(entity, checked ? 'ON' : 'OFF');
    };

    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        {getIcon(entity)}
                        <span>{entity.name}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">fan</Badge>
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-xs text-muted-foreground truncate mb-3">{entity.entity_id}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className={`h-4 w-4 rounded-full ${optimistic ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium">{optimistic ? 'Running' : 'Off'}</span>
                    </div>
                    <Switch
                        checked={optimistic}
                        onCheckedChange={handleChange}
                        disabled={!entity.enabled}
                    />
                </div>
            </CardContent>
        </Card>
    );
}

export default function EntityWidget({ entity }: { entity: Entity }) {
    switch (entity.entity_type) {
        case 'switch':
            return <SwitchWidget entity={entity} />;
        case 'select':
            return <SelectWidget entity={entity} />;
        case 'number':
            return <NumberWidget entity={entity} />;
        case 'button':
            return <ButtonWidget entity={entity} />;
        case 'binary_sensor':
            return <BinarySensorWidget entity={entity} />;
        case 'light':
            return <LightWidget entity={entity} />;
        case 'fan':
            return <FanWidget entity={entity} />;
        case 'sensor':
        default:
            return <SensorWidget entity={entity} />;
    }
}
