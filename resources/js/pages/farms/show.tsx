import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, MapPin, Cpu, Sprout } from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Heading from '@/components/heading';

type Zone = {
    id: number;
    name: string;
    type: string | null;
    capacity: number | null;
    description: string | null;
    devices: Array<{ id: number }>;
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
};

export default function FarmsShow({ farm }: Props) {
    const [editFarmOpen, setEditFarmOpen] = useState(false);
    const [addZoneOpen, setAddZoneOpen] = useState(false);
    const [editZone, setEditZone] = useState<Zone | null>(null);
    const [deleteZone, setDeleteZone] = useState<Zone | null>(null);

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
        setEditZone(zone);
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
                        <Card key={zone.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-lg">
                                    <span>{zone.name}</span>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditZone(zone)}>
                                            <Pencil className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteZone(zone)}>
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-1 text-sm text-muted-foreground">
                                    <p>Type: {zone.type ?? 'General'}</p>
                                    <p className="flex items-center gap-1">
                                        <Cpu className="h-3 w-3" /> Devices: {zone.devices?.length ?? 0}
                                        {zone.capacity !== null && <span className="text-xs">/ {zone.capacity} max</span>}
                                    </p>
                                    <p className="flex items-center gap-1">
                                        <Sprout className="h-3 w-3" /> Crop Cycles: {zone.crop_cycles?.length ?? 0}
                                    </p>
                                    {zone.capacity !== null && (
                                        <div className="mt-2">
                                            <div className="flex items-center justify-between text-xs">
                                                <span>Capacity</span>
                                                <span>{(zone.devices?.length ?? 0)} / {zone.capacity}</span>
                                            </div>
                                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-background/50">
                                                <div
                                                    className="h-full rounded-full bg-primary transition-all"
                                                    style={{ width: `${Math.min(100, ((zone.devices?.length ?? 0) / zone.capacity) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                    {zone.description && (
                                        <p className="mt-2 text-xs">{zone.description}</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {farm.zones.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                        No zones yet. Add a zone to organize your devices and crop cycles.
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
                                <Label htmlFor="zone-capacity">Capacity (max devices)</Label>
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
                <DialogContent>
                    <form onSubmit={updateZone}>
                        <DialogHeader>
                            <DialogTitle>Edit Zone</DialogTitle>
                            <DialogDescription>Update zone details</DialogDescription>
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
                                <Label htmlFor="edit-zone-capacity">Capacity (max devices)</Label>
                                <Input id="edit-zone-capacity" type="number" min="1" value={zoneForm.capacity} onChange={e => setZoneForm({ ...zoneForm, capacity: e.target.value })} placeholder="Leave empty for unlimited" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="edit-zone-description">Description</Label>
                                <Textarea id="edit-zone-description" value={zoneForm.description} onChange={e => setZoneForm({ ...zoneForm, description: e.target.value })} />
                            </div>
                        </div>
                        <DialogFooter>
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
                            Are you sure you want to delete {deleteZone?.name}? This will also remove all devices and crop cycles in this zone. This action cannot be undone.
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
