import { Head, Link, router, usePoll } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Wifi, WifiOff, Trash2, Unplug, MapPin } from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import EntityWidget from '@/components/entity-widget';

type Zone = { id: number; name: string; farm: { name: string } };

type Props = {
    device: {
        id: number;
        name: string;
        device_type: string | null;
        manufacturer: string | null;
        esphome_node: string | null;
        mqtt_topic: string | null;
        ip_address: string | null;
        firmware_version: string | null;
        status: string;
        last_seen: string | null;
        zone_id: number | null;
        zone: Zone | null;
        entities: Array<{
            id: number;
            entity_id: string;
            name: string;
            entity_type: string;
            unit: string | null;
            device_class: string | null;
            enabled: boolean;
            attributes: Record<string, unknown> | null;
            latest_state: { value: string; recorded_at: string; attributes: Record<string, unknown> | null } | null;
        }>;
    };
    zones: Zone[];
};

export default function DevicesShow({ device, zones }: Props) {
    const [disconnectOpen, setDisconnectOpen] = useState(false);
    const [removeOpen, setRemoveOpen] = useState(false);

    usePoll(5000, { only: ['device'] });

    const handleZoneChange = (zoneId: string) => {
        router.put(`/devices/${device.id}`, {
            name: device.name,
            zone_id: zoneId === 'none' ? null : Number(zoneId),
            status: device.status,
        }, {
            preserveScroll: true,
            only: ['device'],
        });
    };

    const handleDisconnect = () => {
        router.post(`/devices/${device.id}/disconnect`, {}, {
            onSuccess: () => setDisconnectOpen(false),
        });
    };

    const handleRemove = () => {
        router.delete(`/devices/${device.id}`, {
            onSuccess: () => setRemoveOpen(false),
        });
    };

    return (
        <>
            <Head title={device.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/devices">
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            {device.status === 'online' ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
                            <Heading title={device.name} description={device.esphome_node ?? device.device_type ?? ''} />
                        </div>
                        <Badge variant={device.status === 'online' ? 'default' : device.status === 'disconnected' ? 'outline' : 'secondary'}>{device.status}</Badge>
                    </div>
                    <div className="flex gap-2">
                        {device.status !== 'disconnected' && (
                            <Button variant="secondary" size="sm" onClick={() => setDisconnectOpen(true)}>
                                <Unplug className="mr-2 h-4 w-4" /> Disconnect
                            </Button>
                        )}
                        <Button variant="destructive" size="sm" onClick={() => setRemoveOpen(true)}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-5">
                    <Card><CardHeader><CardTitle className="text-sm">Type</CardTitle></CardHeader><CardContent>{device.device_type ?? 'N/A'}</CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm">Manufacturer</CardTitle></CardHeader><CardContent>{device.manufacturer ?? 'N/A'}</CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm">IP Address</CardTitle></CardHeader><CardContent>{device.ip_address ?? 'N/A'}</CardContent></Card>
                    <Card><CardHeader><CardTitle className="text-sm">Firmware</CardTitle></CardHeader><CardContent>{device.firmware_version ?? 'N/A'}</CardContent></Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> Zone</CardTitle></CardHeader>
                        <CardContent>
                            <Select value={device.zone_id?.toString() ?? 'none'} onValueChange={handleZoneChange}>
                                <SelectTrigger className="h-8 text-xs">
                                    <SelectValue placeholder="No zone" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No zone</SelectItem>
                                    {zones.map(zone => (
                                        <SelectItem key={zone.id} value={zone.id.toString()}>
                                            {zone.name} — {zone.farm.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>
                </div>

                <div>
                    <h3 className="mb-3 text-lg font-semibold">Entities</h3>
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {device.entities.map(entity => (
                            <div key={entity.id} className={entity.enabled ? '' : 'opacity-50'}>
                                <EntityWidget entity={entity} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t pt-4">
                    {device.status !== 'disconnected' && (
                        <Button variant="secondary" onClick={() => setDisconnectOpen(true)}>
                            <Unplug className="mr-2 h-4 w-4" /> Disconnect Device
                        </Button>
                    )}
                    <Button variant="destructive" onClick={() => setRemoveOpen(true)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Remove Device
                    </Button>
                </div>
            </div>

            <Dialog open={disconnectOpen} onOpenChange={setDisconnectOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Disconnect Device</DialogTitle>
                        <DialogDescription>
                            This will mark {device.name} as disconnected. Its data and entities will be preserved.
                            You can reconnect it later by updating its status.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDisconnectOpen(false)}>Cancel</Button>
                        <Button variant="secondary" onClick={handleDisconnect}>
                            <Unplug className="mr-2 h-4 w-4" /> Disconnect
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={removeOpen} onOpenChange={setRemoveOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Remove Device</DialogTitle>
                        <DialogDescription>
                            This will permanently delete {device.name} and all its entities and historical data.
                            This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRemoveOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleRemove}>
                            <Trash2 className="mr-2 h-4 w-4" /> Remove
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

DevicesShow.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Devices', href: '/devices' },
        { title: props.device?.name ?? 'Device', href: `/devices/${props.device?.id}` },
    ],
});
