import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, Plus, Pencil, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/heading';
import ZoneCard from '@/components/zone-card';

type Zone = {
    id: number;
    name: string;
    type: string | null;
    capacity: number | null;
    description: string | null;
    hidden_entity_ids: number[] | null;
    graph_entity_ids: number[] | null;
    devices: Array<{
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
    }>;
    crop_cycles: Array<{ id: number }>;
};

type Props = {
    farm: {
        id: number;
        name: string;
        location: string | null;
        description: string | null;
        zones: Zone[];
    };
    devices: Array<{
        id: number;
        name: string;
        status: string;
        zone_id: number | null;
    }>;
};

export default function FarmsShow({ farm, devices }: Props) {
    const [editFarmOpen, setEditFarmOpen] = useState(false);
    const [addZoneOpen, setAddZoneOpen] = useState(false);
    const [editZone, setEditZone] = useState<Zone | null>(null);
    const [deleteZone, setDeleteZone] = useState<Zone | null>(null);
    const [hiddenEntityIds, setHiddenEntityIds] = useState<number[]>([]);
    const [graphEntityIds, setGraphEntityIds] = useState<number[]>([]);

    const [farmForm, setFarmForm] = useState({
        name: farm.name,
        location: farm.location ?? '',
        description: farm.description ?? '',
    });

    const [zoneForm, setZoneForm] = useState({
        name: '',
        type: '',
        capacity: '',
        description: '',
    });

    const updateFarm = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/farms/${farm.id}`, farmForm, {
            onSuccess: () => setEditFarmOpen(false),
        });
    };

    const createZone = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/farms/${farm.id}/zones`, {
            ...zoneForm,
            capacity: zoneForm.capacity ? Number(zoneForm.capacity) : null,
        }, {
            onSuccess: () => {
                setAddZoneOpen(false);
                setZoneForm({ name: '', type: '', capacity: '', description: '' });
            },
        });
    };

    const updateZone = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editZone) return;
        router.put(`/farms/${farm.id}/zones/${editZone.id}`, {
            ...zoneForm,
            capacity: zoneForm.capacity ? Number(zoneForm.capacity) : null,
        }, {
            onSuccess: () => setEditZone(null),
        });
    };

    const handleDeleteZone = () => {
        if (!deleteZone) return;
        router.delete(`/farms/${farm.id}/zones/${deleteZone.id}`, {
            onSuccess: () => setDeleteZone(null),
        });
    };

    const openEditZone = (zone: Zone) => {
        setZoneForm({
            name: zone.name,
            type: zone.type ?? '',
            capacity: zone.capacity?.toString() ?? '',
            description: zone.description ?? '',
        });
        setHiddenEntityIds(zone.hidden_entity_ids ?? []);
        setGraphEntityIds(zone.graph_entity_ids ?? []);
        setEditZone(zone);
    };

    const saveEntityPrefs = async (newHidden: number[], newGraph: number[]) => {
        if (!editZone) return;
        try {
            const res = await fetch(`/farms/${farm.id}/zones/${editZone.id}/entity-prefs`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-XSRF-TOKEN': decodeURIComponent(document.cookie.match(/XSRF-TOKEN=([^;]+)/)?.[1] ?? ''),
                },
                body: JSON.stringify({
                    hidden_entity_ids: newHidden,
                    graph_entity_ids: newGraph,
                }),
            });
            if (res.ok) {
                toast.success('Zone preferences updated');
                router.reload({ only: ['farm'] });
            } else {
                toast.error('Failed to update preferences');
            }
        } catch {
            toast.error('Failed to update preferences');
        }
    };

    const toggleHideEntity = (entityId: number) => {
        const next = hiddenEntityIds.includes(entityId)
            ? hiddenEntityIds.filter(id => id !== entityId)
            : [...hiddenEntityIds, entityId];
        setHiddenEntityIds(next);
        saveEntityPrefs(next, graphEntityIds);
    };

    const toggleGraphEntity = (entityId: number) => {
        const next = graphEntityIds.includes(entityId)
            ? graphEntityIds.filter(id => id !== entityId)
            : [...graphEntityIds, entityId];
        setGraphEntityIds(next);
        saveEntityPrefs(hiddenEntityIds, next);
    };

    return (
        <>
            <Head title={farm.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/farms">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            {farm.location && <MapPin className="h-5 w-5 text-muted-foreground" />}
                            <Heading title={farm.name} description={farm.location ?? ''} />
                        </div>
                    </div>
                    <Button variant="secondary" size="sm" onClick={() => setEditFarmOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Farm
                    </Button>
                </div>

                {farm.description && (
                    <p className="text-muted-foreground">{farm.description}</p>
                )}

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Zones</h3>
                    <Button size="sm" onClick={() => setAddZoneOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" /> Add Zone
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {farm.zones.map(zone => (
                        <ZoneCard key={zone.id} zone={zone} farmId={farm.id} onEdit={openEditZone} />
                    ))}
                </div>

                {farm.zones.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                        No zones yet. Add a zone to organize your devices and plants.
                    </p>
                )}
            </div>

            {/* Edit Farm Dialog */}
            <Dialog open={editFarmOpen} onOpenChange={setEditFarmOpen}>
                <DialogContent>
                    <form onSubmit={updateFarm}>
                        <DialogHeader>
                            <DialogTitle>Edit Farm</DialogTitle>
                            <DialogDescription>Update farm details</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="farm-name">Name</Label>
                                <Input id="farm-name" value={farmForm.name} onChange={e => setFarmForm({ ...farmForm, name: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="farm-location">Location</Label>
                                <Input id="farm-location" value={farmForm.location} onChange={e => setFarmForm({ ...farmForm, location: e.target.value })} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="farm-description">Description</Label>
                                <Textarea id="farm-description" value={farmForm.description} onChange={e => setFarmForm({ ...farmForm, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Zone Dialog */}
            <Dialog open={addZoneOpen} onOpenChange={setAddZoneOpen}>
                <DialogContent>
                    <form onSubmit={createZone}>
                        <DialogHeader>
                            <DialogTitle>Add Zone</DialogTitle>
                            <DialogDescription>Add a new zone to {farm.name}</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="zone-name">Name *</Label>
                                <Input id="zone-name" value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zone-type">Type</Label>
                                <Input id="zone-type" value={zoneForm.type} onChange={e => setZoneForm({ ...zoneForm, type: e.target.value })} placeholder="greenhouse, outdoor, hydroponic, nursery" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zone-capacity">Capacity (max plants)</Label>
                                <Input id="zone-capacity" type="number" min="1" value={zoneForm.capacity} onChange={e => setZoneForm({ ...zoneForm, capacity: e.target.value })} placeholder="Leave empty for unlimited" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zone-description">Description</Label>
                                <Textarea id="zone-description" value={zoneForm.description} onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button type="submit">Add Zone</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Edit Zone Dialog */}
            <Dialog open={editZone !== null} onOpenChange={() => setEditZone(null)}>
                <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                    <form onSubmit={updateZone}>
                        <DialogHeader>
                            <DialogTitle>Edit Zone</DialogTitle>
                            <DialogDescription>Update zone details and manage devices</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="edit-zone-name">Name *</Label>
                                <Input id="edit-zone-name" value={zoneForm.name} onChange={e => setZoneForm({ ...zoneForm, name: e.target.value })} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-zone-type">Type</Label>
                                <Input id="edit-zone-type" value={zoneForm.type} onChange={e => setZoneForm({ ...zoneForm, type: e.target.value })} placeholder="greenhouse, outdoor, hydroponic, nursery" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-zone-capacity">Capacity (max plants)</Label>
                                <Input id="edit-zone-capacity" type="number" min="1" value={zoneForm.capacity} onChange={e => setZoneForm({ ...zoneForm, capacity: e.target.value })} placeholder="Leave empty for unlimited" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-zone-description">Description</Label>
                                <Textarea id="edit-zone-description" value={zoneForm.description} onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })} />
                            </div>

                            {editZone && (
                                <div className="border-t pt-4">
                                    <Label className="mb-2 block">Devices in this zone</Label>
                                    {editZone.devices && editZone.devices.length > 0 ? (
                                        <div className="space-y-2">
                                            {editZone.devices.map(device => (
                                                <div key={device.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2 w-2 rounded-full ${device.status === 'online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                                        <span className="text-sm">{device.name}</span>
                                                        <span className="text-xs text-muted-foreground">{device.status}</span>
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-destructive h-7"
                                                        onClick={() => router.delete(`/farms/${farm.id}/zones/${editZone.id}/devices/${device.id}`, {
                                                            preserveScroll: true,
                                                            onFinish: () => setEditZone(null),
                                                        })}
                                                    >
                                                        Disconnect
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">No devices assigned</p>
                                    )}

                                    {(() => {
                                        const available = devices.filter(d => d.zone_id !== editZone.id);
                                        if (available.length === 0) return null;
                                        return (
                                            <div className="mt-3">
                                                <Label className="mb-2 block text-xs">Assign a device</Label>
                                                <div className="flex gap-2">
                                                    <select
                                                        id="assign-device"
                                                        className="flex h-9 flex-1 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs"
                                                        defaultValue=""
                                                    >
                                                        <option value="" disabled>Select device...</option>
                                                        {available.map(d => (
                                                            <option key={d.id} value={d.id}>{d.name} ({d.zone_id ? 'in another zone' : 'unassigned'})</option>
                                                        ))}
                                                    </select>
                                                    <Button
                                                        type="button"
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            const select = document.getElementById('assign-device') as HTMLSelectElement;
                                                            if (select?.value) {
                                                                router.post(`/farms/${farm.id}/zones/${editZone.id}/devices`, {
                                                                    device_id: Number(select.value),
                                                                }, {
                                                                    preserveScroll: true,
                                                                    onFinish: () => setEditZone(null),
                                                                });
                                                            }
                                                        }}
                                                    >
                                                        Assign
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {editZone.devices && editZone.devices.length > 0 && (
                                        <>
                                            <div className="mt-4 border-t pt-4">
                                                <Label className="mb-2 block">Visible entities on zone card</Label>
                                                <p className="mb-2 text-xs text-muted-foreground">Uncheck entities to hide them from the zone card preview.</p>
                                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                                    {editZone.devices.flatMap(device =>
                                                        device.entities.map(entity => (
                                                            <label
                                                                key={entity.id}
                                                                className="flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 text-xs hover:bg-muted/50"
                                                            >
                                                                <Checkbox
                                                                    checked={!hiddenEntityIds.includes(entity.id)}
                                                                    onCheckedChange={() => toggleHideEntity(entity.id)}
                                                                />
                                                                <span className="truncate">{entity.name}</span>
                                                                {entity.unit && <span className="text-muted-foreground">({entity.unit})</span>}
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>

                                            <div className="mt-4 border-t pt-4">
                                                <Label className="mb-2 block">Graph entities</Label>
                                                <p className="mb-2 text-xs text-muted-foreground">Check entities to show as graphs on the zone card.</p>
                                                <div className="max-h-48 space-y-1 overflow-y-auto">
                                                    {editZone.devices.flatMap(device =>
                                                        device.entities.map(entity => (
                                                            <label
                                                                key={`graph-${entity.id}`}
                                                                className="flex cursor-pointer items-center gap-2 rounded border px-2 py-1.5 text-xs hover:bg-muted/50"
                                                            >
                                                                <Checkbox
                                                                    checked={graphEntityIds.includes(entity.id)}
                                                                    onCheckedChange={() => toggleGraphEntity(entity.id)}
                                                                />
                                                                <span className="truncate">{entity.name}</span>
                                                                {entity.unit && <span className="text-muted-foreground">({entity.unit})</span>}
                                                            </label>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <DialogFooter className="flex justify-between">
                            <Button type="button" variant="destructive" size="sm" onClick={() => { setDeleteZone(editZone); setEditZone(null); }}>
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Zone
                            </Button>
                            <Button type="submit">Save Changes</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Zone Confirmation */}
            <Dialog open={deleteZone !== null} onOpenChange={() => setDeleteZone(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Zone</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {deleteZone?.name}? This will also remove all devices and plants in this zone. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteZone(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDeleteZone}>
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

FarmsShow.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Farms', href: '/farms' },
        { title: props.farm?.name ?? 'Farm', href: `/farms/${props.farm?.id}` },
    ],
});
