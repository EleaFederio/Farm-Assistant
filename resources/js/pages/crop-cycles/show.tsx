import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

const statusColors: Record<string, string> = {
    planned: 'bg-gray-100 text-gray-800', active: 'bg-blue-100 text-blue-800',
    growing: 'bg-green-100 text-green-800', harvesting: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-emerald-100 text-emerald-800', failed: 'bg-red-100 text-red-800',
};

type Props = {
    cycle: {
        id: number;
        name: string;
        quantity: number;
        status: string;
        start_date: string | null;
        expected_harvest_date: string | null;
        actual_harvest_date: string | null;
        notes: string | null;
        crop: { id: number; name: string };
        zone: { id: number; name: string; farm: { id: number; name: string } };
        tasks: Array<{ id: number; title: string; status: string; priority: string }>;
        calendar_events: Array<{ id: number; title: string; event_date: string; event_type: string }>;
    };
};

export default function CropCyclesShow({ cycle }: Props) {
    const updateStatus = (status: string) => {
        router.put(`/crop-cycles/${cycle.id}`, {
            status,
            actual_harvest_date: status === 'completed' ? new Date().toISOString().split('T')[0] : cycle.actual_harvest_date,
        });
    };

    return (
        <>
            <Head title={cycle.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/crop-cycles">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <div className="flex-1">
                        <Heading title={cycle.name} description={`${cycle.crop.name} - ${cycle.zone.name}`} />
                    </div>
                    <Badge className={statusColors[cycle.status]}>{cycle.status}</Badge>
                </div>

                <div className="flex gap-2">
                    {['planned', 'active', 'growing', 'harvesting', 'completed'].map(s => (
                        <Button key={s} variant={cycle.status === s ? 'default' : 'outline'} size="sm" onClick={() => updateStatus(s)}>
                            {s}
                        </Button>
                    ))}
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Crop</CardTitle></CardHeader>
                        <CardContent><p className="text-lg font-semibold">{cycle.crop.name}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Start Date</CardTitle></CardHeader>
                        <CardContent><p className="text-lg font-semibold">{cycle.start_date ?? 'Not set'}</p></CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Expected Harvest</CardTitle></CardHeader>
                        <CardContent><p className="text-lg font-semibold">{cycle.expected_harvest_date ?? 'Not set'}</p></CardContent>
                    </Card>
                </div>

                {cycle.notes && (
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Notes</CardTitle></CardHeader>
                        <CardContent><p className="text-sm text-muted-foreground whitespace-pre-wrap">{cycle.notes}</p></CardContent>
                    </Card>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Tasks</CardTitle></CardHeader>
                        <CardContent>
                            {cycle.tasks.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No tasks</p>
                            ) : (
                                <ul className="space-y-1">
                                    {cycle.tasks.map(t => (
                                        <li key={t.id} className="flex items-center justify-between text-sm">
                                            <span>{t.title}</span>
                                            <Badge variant="outline">{t.status}</Badge>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle className="text-sm">Calendar Events</CardTitle></CardHeader>
                        <CardContent>
                            {cycle.calendar_events.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No events</p>
                            ) : (
                                <ul className="space-y-1">
                                    {cycle.calendar_events.map(e => (
                                        <li key={e.id} className="flex items-center justify-between text-sm">
                                            <span>{e.title}</span>
                                            <span className="text-muted-foreground">{e.event_date}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

CropCyclesShow.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Crop Cycles', href: '/crop-cycles' },
        { title: props.cycle?.name ?? 'Cycle', href: `/crop-cycles/${props.cycle?.id}` },
    ],
});
