import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, FlaskConical, Plus } from 'lucide-react';
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
import Heading from '@/components/heading';

type Props = {
    system: {
        id: number;
        name: string;
        system_type: string | null;
        reservoir_volume: string | null;
        water_capacity: string | null;
        notes: string | null;
        zone: { id: number; name: string; farm: { name: string } };
        nutrient_solutions: Array<{
            id: number;
            ph_target: string | null;
            ec_target: string | null;
            water_volume: string | null;
            last_mixed_at: string | null;
            notes: string | null;
        }>;
    };
};

export default function HydroponicsShow({ system }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ ph_target: '', ec_target: '', water_volume: '', notes: '' });

    const addNutrient = (e: React.FormEvent) => {
        e.preventDefault();
        router.post(`/hydroponics/${system.id}/nutrient`, {
            ...form,
            ph_target: form.ph_target ? Number(form.ph_target) : null,
            ec_target: form.ec_target ? Number(form.ec_target) : null,
            water_volume: form.water_volume ? Number(form.water_volume) : null,
        }, {
            onSuccess: () => { setOpen(false); setForm({ ph_target: '', ec_target: '', water_volume: '', notes: '' }); },
        });
    };

    return (
        <>
            <Head title={system.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/hydroponics">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <FlaskConical className="h-5 w-5 text-primary" />
                        <Heading title={system.name} description={`${system.system_type ?? 'System'} · ${system.zone.name}, ${system.zone.farm.name}`} />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Reservoir Volume</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-semibold">{system.reservoir_volume ? `${system.reservoir_volume} L` : 'N/A'}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Water Capacity</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-semibold">{system.water_capacity ? `${system.water_capacity} L` : 'N/A'}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Nutrient Mixes</CardTitle></CardHeader>
                        <CardContent><p className="text-xl font-semibold">{system.nutrient_solutions.length}</p></CardContent>
                    </Card>
                </div>

                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Nutrient Solutions</h3>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button size="sm"><Plus className="mr-2 h-4 w-4" /> Log Nutrient Mix</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={addNutrient}>
                                <DialogHeader><DialogTitle>Log Nutrient Solution</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Target pH</Label>
                                            <Input type="number" step="0.1" value={form.ph_target} onChange={e => setForm({...form, ph_target: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Target EC</Label>
                                            <Input type="number" step="0.1" value={form.ec_target} onChange={e => setForm({...form, ec_target: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Water Volume (L)</Label>
                                        <Input type="number" value={form.water_volume} onChange={e => setForm({...form, water_volume: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Notes</Label>
                                        <Textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit">Log</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-2">
                    {system.nutrient_solutions.map(ns => (
                        <Card key={ns.id}>
                            <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-4">
                                        <div>
                                            <p className="text-sm text-muted-foreground">pH Target</p>
                                            <p className="font-semibold">{ns.ph_target ?? '--'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">EC Target</p>
                                            <p className="font-semibold">{ns.ec_target ?? '--'} mS/cm</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Volume</p>
                                            <p className="font-semibold">{ns.water_volume ? `${ns.water_volume}L` : '--'}</p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {ns.last_mixed_at ? new Date(ns.last_mixed_at).toLocaleString() : ''}
                                    </p>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}

HydroponicsShow.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Hydroponics', href: '/hydroponics' },
        { title: props.system?.name ?? 'System', href: `/hydroponics/${props.system?.id}` },
    ],
});
