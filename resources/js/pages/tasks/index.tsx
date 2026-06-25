import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

const priorityColors: Record<string, string> = {
    low: 'bg-gray-100 text-gray-800', medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800', urgent: 'bg-red-100 text-red-800',
};

const statusIcons: Record<string, any> = {
    pending: Clock, in_progress: AlertTriangle, completed: CheckCircle2, cancelled: Clock,
};

type Props = {
    tasks: Array<{
        id: number;
        title: string;
        description: string | null;
        priority: string;
        status: string;
        due_date: string | null;
        completed_at: string | null;
        farm: { id: number; name: string };
        crop_cycle: { id: number; name: string; crop: { name: string } } | null;
    }>;
    filters: { status?: string; priority?: string };
};

export default function TasksIndex({ tasks, filters }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        farm_id: '', crop_cycle_id: '', title: '', description: '',
        priority: 'medium', due_date: '',
    });

    const createTask = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/tasks', {
            ...form,
            farm_id: Number(form.farm_id),
            crop_cycle_id: form.crop_cycle_id ? Number(form.crop_cycle_id) : null,
        }, {
            onSuccess: () => { setOpen(false); setForm({ farm_id: '', crop_cycle_id: '', title: '', description: '', priority: 'medium', due_date: '' }); },
        });
    };

    const updateStatus = (task: any, status: string) => {
        router.put(`/tasks/${task.id}`, {
            title: task.title,
            status,
            priority: task.priority,
            description: task.description ?? '',
            due_date: task.due_date,
        });
    };

    return (
        <>
            <Head title="Tasks" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Tasks" description="Manage farm tasks and to-dos" />
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> New Task</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={createTask}>
                                <DialogHeader><DialogTitle>Create Task</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Title *</Label>
                                        <Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Description</Label>
                                        <Textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Priority</Label>
                                        <Select value={form.priority} onValueChange={v => setForm({...form, priority: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['low', 'medium', 'high', 'urgent'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Due Date</Label>
                                        <Input type="datetime-local" value={form.due_date} onChange={e => setForm({...form, due_date: e.target.value})} />
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-2">
                    {tasks.map(task => {
                        const StatusIcon = statusIcons[task.status] ?? Clock;
                        return (
                            <Card key={task.id}>
                                <CardHeader className="py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button onClick={() => updateStatus(task, task.status === 'completed' ? 'pending' : 'completed')}>
                                                <StatusIcon className={`h-5 w-5 ${task.status === 'completed' ? 'text-green-500' : 'text-muted-foreground'}`} />
                                            </button>
                                            <div>
                                                <CardTitle className={`text-base ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''}`}>
                                                    {task.title}
                                                </CardTitle>
                                                <p className="text-xs text-muted-foreground">
                                                    {task.farm.name}
                                                    {task.crop_cycle && ` · ${task.crop_cycle.name}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                                            <Badge variant="outline">{task.status.replace('_', ' ')}</Badge>
                                            {task.due_date && (
                                                <span className="text-xs text-muted-foreground">
                                                    {new Date(task.due_date).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        );
                    })}
                </div>
                {tasks.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">No tasks found.</p>
                )}
            </div>
        </>
    );
}
