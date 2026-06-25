import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Wifi, WifiOff, Search, Cpu, MoreVertical, Unplug, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Heading from '@/components/heading';

type Props = {
    devices: Array<{
        id: number;
        name: string;
        friendly_name: string | null;
        device_type: string | null;
        esphome_node: string | null;
        mac_address: string | null;
        status: string;
        ip_address: string | null;
        last_seen: string | null;
        firmware_version: string | null;
        zone: { id: number; name: string; farm: { name: string } } | null;
        entities_count: number;
    }>;
    zones: Array<{ id: number; name: string; farm: { id: number; name: string } }>;
};

export default function DevicesIndex({ devices, zones }: Props) {
    const [manualOpen, setManualOpen] = useState(false);
    const [actionTarget, setActionTarget] = useState<{ id: number; name: string; action: 'disconnect' | 'remove' } | null>(null);
    const [form, setForm] = useState({
        name: '', device_type: '', manufacturer: '', esphome_node: '',
        mqtt_topic: '', ip_address: '', firmware_version: '', zone_id: '',
    });

    const createDevice = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/devices', {
            ...form,
            zone_id: form.zone_id ? Number(form.zone_id) : null,
        }, {
            onSuccess: () => { setManualOpen(false); setForm({ name: '', device_type: '', manufacturer: '', esphome_node: '', mqtt_topic: '', ip_address: '', firmware_version: '', zone_id: '' }); },
        });
    };

    const handleAction = () => {
        if (!actionTarget) return;
        if (actionTarget.action === 'disconnect') {
            router.post(`/devices/${actionTarget.id}/disconnect`, {}, {
                onSuccess: () => setActionTarget(null),
            });
        } else {
            router.delete(`/devices/${actionTarget.id}`, {
                onSuccess: () => setActionTarget(null),
            });
        }
    };

    return (
        <>
            <Head title="Devices" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Devices" description="ESPHome and IoT devices" />
                    <div className="flex gap-2">
                        <Link href="/devices/discover">
                            <Button variant="secondary">
                                <Search className="mr-2 h-4 w-4" /> Discover ESPHome
                            </Button>
                        </Link>
                        <Dialog open={manualOpen} onOpenChange={setManualOpen}>
                            <DialogTrigger asChild>
                                <Button><Plus className="mr-2 h-4 w-4" /> Manual Add</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <form onSubmit={createDevice}>
                                    <DialogHeader><DialogTitle>Add Device Manually</DialogTitle><DialogDescription>Enter device details manually</DialogDescription></DialogHeader>
                                    <div className="grid max-h-[60vh] gap-4 overflow-y-auto py-4">
                                        <div className="grid gap-2">
                                            <Label>Name *</Label>
                                            <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>ESPHome Node Name</Label>
                                            <Input value={form.esphome_node} onChange={e => setForm({...form, esphome_node: e.target.value})} placeholder="living-room-sensor" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>IP Address</Label>
                                            <Input value={form.ip_address} onChange={e => setForm({...form, ip_address: e.target.value})} placeholder="192.168.1.100" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Device Type</Label>
                                            <Input value={form.device_type} onChange={e => setForm({...form, device_type: e.target.value})} placeholder="ESP32" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Manufacturer</Label>
                                            <Input value={form.manufacturer} onChange={e => setForm({...form, manufacturer: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>MQTT Topic</Label>
                                            <Input value={form.mqtt_topic} onChange={e => setForm({...form, mqtt_topic: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Zone</Label>
                                            <select value={form.zone_id} onChange={e => setForm({...form, zone_id: e.target.value})} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs">
                                                <option value="">No zone</option>
                                                {zones.map(z => <option key={z.id} value={z.id}>{z.name} ({z.farm.name})</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <DialogFooter><Button type="submit">Add Device</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {devices.map(device => (
                        <div key={device.id} className="group relative">
                            <Link href={`/devices/${device.id}`}>
                                <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                                    <CardHeader>
                                        <CardTitle className="flex items-center justify-between text-lg">
                                            <span className="flex items-center gap-2">
                                                {device.status === 'online' ? <Wifi className="h-4 w-4 text-green-500" /> : <WifiOff className="h-4 w-4 text-red-500" />}
                                                <div className="truncate">
                                                    {device.friendly_name ?? device.name}
                                                    {device.esphome_node && <span className="ml-1 text-xs text-muted-foreground">({device.esphome_node})</span>}
                                                </div>
                                            </span>
                                            <Badge variant={device.status === 'online' ? 'default' : 'secondary'}>{device.status}</Badge>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                            <span>Type: {device.device_type ?? 'N/A'}</span>
                                            <span>|</span>
                                            <span>Entities: {device.entities_count}</span>
                                        </div>
                                        {device.ip_address && (
                                            <p className="text-xs text-muted-foreground">IP: {device.ip_address}</p>
                                        )}
                                        {device.firmware_version && (
                                            <p className="text-xs text-muted-foreground">FW: {device.firmware_version}</p>
                                        )}
                                        {device.zone && (
                                            <p className="text-xs text-muted-foreground">{device.zone.name} - {device.zone.farm.name}</p>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                            <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        {device.status !== 'disconnected' && (
                                            <DropdownMenuItem onClick={() => setActionTarget({ id: device.id, name: device.friendly_name ?? device.name, action: 'disconnect' })}>
                                                <Unplug className="mr-2 h-4 w-4" /> Disconnect
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => setActionTarget({ id: device.id, name: device.friendly_name ?? device.name, action: 'remove' })} className="text-destructive">
                                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>

                {devices.length === 0 && (
                    <div className="flex flex-col items-center gap-4 py-16">
                        <Cpu className="h-16 w-16 text-muted-foreground/40" />
                        <p className="text-lg text-muted-foreground">No devices yet</p>
                        <p className="text-sm text-muted-foreground">Discover ESPHome devices on your network or add one manually</p>
                        <div className="flex gap-3">
                            <Link href="/devices/discover">
                                <Button variant="secondary" size="lg"><Search className="mr-2 h-4 w-4" /> Discover ESPHome Devices</Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={actionTarget !== null} onOpenChange={() => setActionTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{actionTarget?.action === 'disconnect' ? 'Disconnect' : 'Remove'} Device</DialogTitle>
                        <DialogDescription>
                            {actionTarget?.action === 'disconnect'
                                ? `This will mark ${actionTarget?.name} as disconnected. Its data and entities will be preserved.`
                                : `This will permanently delete ${actionTarget?.name} and all its entities and historical data. This action cannot be undone.`}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setActionTarget(null)}>Cancel</Button>
                        <Button
                            variant={actionTarget?.action === 'remove' ? 'destructive' : 'secondary'}
                            onClick={handleAction}
                        >
                            {actionTarget?.action === 'remove'
                                ? <><Trash2 className="mr-2 h-4 w-4" /> Remove</>
                                : <><Unplug className="mr-2 h-4 w-4" /> Disconnect</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
