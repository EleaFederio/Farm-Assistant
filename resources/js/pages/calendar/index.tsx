import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

type Props = {
    events: Array<{
        id: number;
        event_type: string;
        title: string;
        description: string | null;
        event_date: string;
        farm: { name: string };
        crop_cycle: { name: string; crop: { name: string } } | null;
    }>;
    cropCycles: Array<{
        title: string;
        start: string | null;
        end: string | null;
        status: string;
        type: string;
    }>;
    currentMonth: number;
    currentYear: number;
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function CalendarIndex({ events, cropCycles, currentMonth, currentYear }: Props) {
    const [month, setMonth] = useState(currentMonth);
    const [year, setYear] = useState(currentYear);
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ farm_id: '', title: '', event_type: 'sowing', event_date: '', description: '' });

    const navigate = (delta: number) => {
        const d = new Date(year, month - 1 + delta, 1);
        setMonth(d.getMonth() + 1);
        setYear(d.getFullYear());
        router.get('/calendar', { month: d.getMonth() + 1, year: d.getFullYear() }, { preserveState: true });
    };

    const createEvent = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/calendar', { ...form, farm_id: Number(form.farm_id) }, {
            onSuccess: () => { setOpen(false); setForm({ farm_id: '', title: '', event_type: 'sowing', event_date: '', description: '' }); },
        });
    };

    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const eventsByDate: Record<number, any[]> = {};
    events.forEach(e => {
        const d = new Date(e.event_date);
        if (d.getMonth() + 1 === month && d.getFullYear() === year) {
            const day = d.getDate();
            if (!eventsByDate[day]) eventsByDate[day] = [];
            eventsByDate[day].push(e);
        }
    });
    cropCycles.forEach(c => {
        if (!c.start) return;
        const start = new Date(c.start);
        const end = c.end ? new Date(c.end) : start;
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (d.getMonth() + 1 === month && d.getFullYear() === year) {
                const day = d.getDate();
                if (!eventsByDate[day]) eventsByDate[day] = [];
                eventsByDate[day].push({ id: `cycle-${c.title}`, title: c.title, event_type: 'cycle', crop_cycle: null, description: c.status, farm: { name: '' }, event_date: d.toISOString() });
            }
        }
    });

    return (
        <>
            <Head title="Calendar" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Calendar" description="Sowing and harvesting calendar" />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> Add Event</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={createEvent}>
                                <DialogHeader><DialogTitle>New Calendar Event</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Title *</Label>
                                        <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Event Type</Label>
                                        <select value={form.event_type} onChange={e => setForm({...form, event_type: e.target.value})} className="flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs">
                                            <option value="sowing">Sowing</option>
                                            <option value="harvesting">Harvesting</option>
                                            <option value="fertilizing">Fertilizing</option>
                                            <option value="watering">Watering</option>
                                            <option value="maintenance">Maintenance</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Date *</Label>
                                        <Input type="datetime-local" value={form.event_date} onChange={e => setForm({...form, event_date: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <Button variant="ghost" onClick={() => navigate(-1)}><ChevronLeft className="h-4 w-4" /></Button>
                            <CardTitle className="text-lg">{monthNames[month - 1]} {year}</CardTitle>
                            <Button variant="ghost" onClick={() => navigate(1)}><ChevronRight className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-px">
                            {dayNames.map(d => <div key={d} className="p-2 text-center text-xs font-medium text-muted-foreground">{d}</div>)}
                            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
                            {days.map(day => {
                                const dayEvents = eventsByDate[day] ?? [];
                                return (
                                    <div key={day} className={`min-h-20 rounded-lg border p-1 ${dayEvents.length > 0 ? 'bg-accent/30' : ''}`}>
                                        <p className="p-1 text-sm font-medium">{day}</p>
                                        <div className="space-y-0.5">
                                            {dayEvents.slice(0, 3).map((e: any) => (
                                                <Badge key={e.id} variant={e.event_type === 'cycle' ? 'secondary' : 'outline'} className="w-full justify-start truncate text-[10px]">
                                                    {e.title}
                                                </Badge>
                                            ))}
                                            {dayEvents.length > 3 && (
                                                <p className="text-[10px] text-muted-foreground">+{dayEvents.length - 3} more</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                <div>
                    <h3 className="mb-2 text-sm font-medium text-muted-foreground">Upcoming Events</h3>
                    <div className="space-y-2">
                        {events.slice(0, 10).map(event => (
                            <Card key={event.id}>
                                <CardHeader className="py-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <CardTitle className="text-sm">{event.title}</CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.event_date).toLocaleString()} · {event.event_type}
                                                {event.crop_cycle && ` · ${event.crop_cycle.name}`}
                                            </p>
                                        </div>
                                        <Badge variant="outline">{event.event_type}</Badge>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
