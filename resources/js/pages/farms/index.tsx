import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Plus, Trash2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
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
import Heading from '@/components/heading';

type Farm = {
    id: number;
    name: string;
    location: string | null;
    description: string | null;
    zones_count: number;
    created_at: string;
};

type Props = {
    farms: Farm[];
};

export default function FarmsIndex({ farms }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: '', location: '', description: '' });

    const createFarm = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/farms', form, {
            onSuccess: () => {
                setOpen(false);
                setForm({ name: '', location: '', description: '' });
            },
        });
    };

    const deleteFarm = (id: number) => {
        if (confirm('Delete this farm?')) {
            router.delete(`/farms/${id}`);
        }
    };

    return (
        <>
            <Head title="Farms" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Farms" description="Manage your farm locations" />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" /> New Farm
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={createFarm}>
                                <DialogHeader>
                                    <DialogTitle>Create Farm</DialogTitle>
                                    <DialogDescription>Add a new farm location</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input id="name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="location">Location</Label>
                                        <Input id="location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea id="description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {farms.map(farm => (
                        <Card key={farm.id}>
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    <Link href={`/farms/${farm.id}`} className="hover:underline">
                                        {farm.name}
                                    </Link>
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" asChild>
                                            <Link href={`/farms/${farm.id}`}>
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={() => deleteFarm(farm.id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardTitle>
                                {farm.location && (
                                    <CardDescription className="flex items-center gap-1">
                                        <MapPin className="h-3 w-3" /> {farm.location}
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {farm.zones_count} zones
                                </p>
                                {farm.description && (
                                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                        {farm.description}
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                    {farms.length === 0 && (
                        <p className="col-span-full py-8 text-center text-muted-foreground">
                            No farms yet. Create your first farm!
                        </p>
                    )}
                </div>
            </div>
        </>
    );
}
