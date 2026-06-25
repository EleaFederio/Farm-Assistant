import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, Trash2, Thermometer, Droplets, FlaskConical } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Heading from '@/components/heading';

type Crop = {
    id: number;
    name: string;
    scientific_name: string | null;
    category: string | null;
    days_to_harvest: number | null;
    optimal_ph_min: string | null;
    optimal_ph_max: string | null;
    optimal_tds_min: number | null;
    optimal_tds_max: number | null;
    optimal_temp_min: string | null;
    optimal_temp_max: string | null;
    crop_cycles_count: number;
};

type Props = {
    crops: Crop[];
};

const emptyForm = {
    name: '', scientific_name: '', category: '', days_to_harvest: '',
    optimal_ph_min: '', optimal_ph_max: '',
    optimal_tds_min: '', optimal_tds_max: '',
    optimal_temp_min: '', optimal_temp_max: '',
    description: '',
};

export default function CropsIndex({ crops }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const saveCrop = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/crops', {
            ...form,
            days_to_harvest: form.days_to_harvest ? Number(form.days_to_harvest) : null,
            optimal_tds_min: form.optimal_tds_min ? Number(form.optimal_tds_min) : null,
            optimal_tds_max: form.optimal_tds_max ? Number(form.optimal_tds_max) : null,
        }, {
            onSuccess: () => { setOpen(false); setForm(emptyForm); },
        });
    };

    const deleteCrop = (id: number) => {
        if (confirm('Delete this crop?')) router.delete(`/crops/${id}`);
    };

    const categories = ['Vegetables', 'Fruits', 'Herbs', 'Roots', 'Leafy Greens', 'Legumes', 'Grains'];

    return (
        <>
            <Head title="Crops" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Crops" description="Crop database with optimal growing conditions" />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> New Crop</Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[80vh] overflow-y-auto">
                            <form onSubmit={saveCrop}>
                                <DialogHeader>
                                    <DialogTitle>Create Crop</DialogTitle>
                                    <DialogDescription>Add a new crop to the database</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name *</Label>
                                        <Input id="name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="scientific_name">Scientific Name</Label>
                                        <Input id="scientific_name" value={form.scientific_name} onChange={e => setForm({...form, scientific_name: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="category">Category</Label>
                                        <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                            <SelectContent>
                                                {categories.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="days_to_harvest">Days to Harvest</Label>
                                        <Input id="days_to_harvest" type="number" value={form.days_to_harvest} onChange={e => setForm({...form, days_to_harvest: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Min pH</Label>
                                            <Input type="number" step="0.1" value={form.optimal_ph_min} onChange={e => setForm({...form, optimal_ph_min: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Max pH</Label>
                                            <Input type="number" step="0.1" value={form.optimal_ph_max} onChange={e => setForm({...form, optimal_ph_max: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Min TDS (ppm)</Label>
                                            <Input type="number" value={form.optimal_tds_min} onChange={e => setForm({...form, optimal_tds_min: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Max TDS (ppm)</Label>
                                            <Input type="number" value={form.optimal_tds_max} onChange={e => setForm({...form, optimal_tds_max: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Min Temp (°C)</Label>
                                            <Input type="number" step="0.1" value={form.optimal_temp_min} onChange={e => setForm({...form, optimal_temp_min: e.target.value})} />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Max Temp (°C)</Label>
                                            <Input type="number" step="0.1" value={form.optimal_temp_max} onChange={e => setForm({...form, optimal_temp_max: e.target.value})} />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {crops.map(crop => (
                        <Card key={crop.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between text-lg">
                                    {crop.name}
                                    <Button variant="ghost" size="icon" onClick={() => deleteCrop(crop.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </CardTitle>
                                {crop.scientific_name && (
                                    <p className="text-xs italic text-muted-foreground">{crop.scientific_name}</p>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-3 text-sm">
                                    {crop.category && (
                                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs">{crop.category}</span>
                                    )}
                                    {crop.days_to_harvest && (
                                        <span className="flex items-center gap-1 text-muted-foreground">
                                            <FlaskConical className="h-3 w-3" /> {crop.days_to_harvest}d
                                        </span>
                                    )}
                                </div>
                                {(crop.optimal_ph_min || crop.optimal_temp_min || crop.optimal_tds_min) && (
                                    <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                                        {crop.optimal_ph_min && (
                                            <p className="flex items-center gap-1"><Droplets className="h-3 w-3" /> pH: {crop.optimal_ph_min}-{crop.optimal_ph_max}</p>
                                        )}
                                        {crop.optimal_temp_min && (
                                            <p className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp: {crop.optimal_temp_min}-{crop.optimal_temp_max}°C</p>
                                        )}
                                        {crop.optimal_tds_min && (
                                            <p className="flex items-center gap-1">TDS: {crop.optimal_tds_min}-{crop.optimal_tds_max} ppm</p>
                                        )}
                                    </div>
                                )}
                                <p className="mt-2 text-xs text-muted-foreground">
                                    {crop.crop_cycles_count} cycle{crop.crop_cycles_count !== 1 ? 's' : ''}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </>
    );
}
