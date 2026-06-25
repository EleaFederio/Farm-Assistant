import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Heading from '@/components/heading';
import { Link } from '@inertiajs/react';

type Props = {
    crops: Array<{ id: number; name: string }>;
    zones: Array<{ id: number; name: string; farm: { id: number; name: string } }>;
};

export default function CropCyclesCreate({ crops, zones }: Props) {
    const [form, setForm] = useState({
        crop_id: '',
        zone_id: '',
        name: '',
        quantity: '',
        start_date: '',
        expected_harvest_date: '',
        status: 'planned',
        notes: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/crop-cycles', {
            ...form,
            quantity: form.quantity ? Number(form.quantity) : null,
        }, {
            onSuccess: () => { /* redirect handled by server */ },
        });
    };

    return (
        <>
            <Head title="New Crop Cycle" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/crop-cycles">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <Heading title="New Crop Cycle" description="Start a new planting cycle" />
                </div>

                <Card className="max-w-2xl">
                    <CardHeader><CardTitle>Cycle Details</CardTitle></CardHeader>
                    <CardContent>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Cycle Name *</Label>
                                <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="crop_id">Crop *</Label>
                                <Select value={form.crop_id} onValueChange={v => setForm({...form, crop_id: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select crop" /></SelectTrigger>
                                    <SelectContent>
                                        {crops.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="zone_id">Zone *</Label>
                                <Select value={form.zone_id} onValueChange={v => setForm({...form, zone_id: v})}>
                                    <SelectTrigger><SelectValue placeholder="Select zone" /></SelectTrigger>
                                    <SelectContent>
                                        {zones.map(z => <SelectItem key={z.id} value={String(z.id)}>{z.name} ({z.farm.name})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="quantity">Quantity (plants/seeds)</Label>
                                <Input id="quantity" type="number" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="start_date">Start Date</Label>
                                    <Input id="start_date" type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="expected_harvest_date">Expected Harvest</Label>
                                    <Input id="expected_harvest_date" type="date" value={form.expected_harvest_date} onChange={e => setForm({...form, expected_harvest_date: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {['planned', 'active', 'growing', 'harvesting', 'completed', 'failed'].map(s => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} />
                            </div>
                            <Button type="submit">Create Cycle</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
