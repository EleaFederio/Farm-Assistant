import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, FlaskConical, Droplets } from 'lucide-react';
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
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Heading from '@/components/heading';

type Props = {
    systems: Array<{
        id: number;
        name: string;
        system_type: string | null;
        reservoir_volume: string | null;
        water_capacity: string | null;
        zone: { id: number; name: string; farm: { name: string } };
        nutrient_solutions: Array<{ id: number; ph_target: string | null; ec_target: string | null; last_mixed_at: string | null }>;
    }>;
};

export default function HydroponicsIndex({ systems }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        zone_id: '', name: '', system_type: '', reservoir_volume: '', water_capacity: '', notes: '',
    });

    const createSystem = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/hydroponics', {
            ...form,
            zone_id: Number(form.zone_id),
            reservoir_volume: form.reservoir_volume ? Number(form.reservoir_volume) : null,
            water_capacity: form.water_capacity ? Number(form.water_capacity) : null,
        }, {
            onSuccess: () => { setOpen(false); setForm({ zone_id: '', name: '', system_type: '', reservoir_volume: '', water_capacity: '', notes: '' }); },
        });
    };

    return (
        <>
            <Head title="Hydroponics" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Hydroponics" description="Manage hydroponic grow systems" />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> New System</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={createSystem}>
                                <DialogHeader><DialogTitle>Add Hydroponic System</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Name *</Label>
                                        <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>System Type</Label>
                                        <Select value={form.system_type} onValueChange={v => setForm({...form, system_type: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                                            <SelectContent>
                                                {['NFT', 'DWC', 'Ebb & Flow', 'Aeroponic', 'Wick', 'Kratky'].map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Reservoir Volume (L)</Label>
                                            <Input type="number" value={form.reservoir_volume} onChange={e => setForm({...form, reservoir_volume: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Water Capacity (L)</Label>
                                            <Input type="number" value={form.water_capacity} onChange={e => setForm({...form, water_capacity: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Notes</Label>
                                        <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {systems.map(system => (
                        <Link key={system.id} href={`/hydroponics/${system.id}`}>
                            <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <FlaskConical className="h-5 w-5 text-primary" />
                                        {system.name}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Type: {system.system_type ?? 'N/A'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {system.zone.name} · {system.zone.farm.name}
                                    </p>
                                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                                        <Droplets className="h-3 w-3" />
                                        {system.reservoir_volume ? `${system.reservoir_volume}L` : 'N/A'}
                                    </div>
                                    {system.nutrient_solutions[0] && (
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            Last solution: {system.nutrient_solutions[0].last_mixed_at ? new Date(system.nutrient_solutions[0].last_mixed_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    );
}
