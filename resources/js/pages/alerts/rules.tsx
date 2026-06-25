import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, Plus, ToggleLeft, ToggleRight } from 'lucide-react';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';
import { Link } from '@inertiajs/react';

type Props = {
    rules: Array<{
        id: number;
        name: string;
        condition_operator: string;
        threshold_value: string;
        severity: string;
        enabled: boolean;
        notification_channel: string | null;
        entity: { id: number; name: string; device: { name: string; zone: { farm: { name: string } } } };
    }>;
    entities: Array<{ id: number; name: string; device: { name: string } }>;
};

export default function AlertRules({ rules, entities }: Props) {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        entity_id: '', name: '', condition_operator: '>', threshold_value: '',
        severity: 'warning', notification_channel: '',
    });

    const createRule = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/alert-rules', { ...form, entity_id: Number(form.entity_id) }, {
            onSuccess: () => { setOpen(false); setForm({ entity_id: '', name: '', condition_operator: '>', threshold_value: '', severity: 'warning', notification_channel: '' }); },
        });
    };

    const toggleRule = (rule: any) => {
        router.put(`/alert-rules/${rule.id}`, { enabled: !rule.enabled });
    };

    return (
        <>
            <Head title="Alert Rules" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/alerts">
                            <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                        </Link>
                        <Heading title="Alert Rules" description="Configure alert conditions for sensor data" />
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button><Plus className="mr-2 h-4 w-4" /> New Rule</Button>
                        </DialogTrigger>
                        <DialogContent>
                            <form onSubmit={createRule}>
                                <DialogHeader><DialogTitle>Create Alert Rule</DialogTitle></DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label>Name *</Label>
                                        <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Entity *</Label>
                                        <Select value={form.entity_id} onValueChange={v => setForm({...form, entity_id: v})}>
                                            <SelectTrigger><SelectValue placeholder="Select entity" /></SelectTrigger>
                                            <SelectContent>
                                                {entities.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.device.name})</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2">
                                            <Label>Condition</Label>
                                            <Select value={form.condition_operator} onValueChange={v => setForm({...form, condition_operator: v})}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                    {['>', '<', '>=', '<=', '==', '!='].map(op => <SelectItem key={op} value={op}>{op}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label>Threshold</Label>
                                            <Input value={form.threshold_value} onChange={e => setForm({...form, threshold_value: e.target.value})} required />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Severity</Label>
                                        <Select value={form.severity} onValueChange={v => setForm({...form, severity: v})}>
                                            <SelectTrigger><SelectValue /></SelectTrigger>
                                            <SelectContent>
                                                {['info', 'warning', 'critical', 'emergency'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Notification Channel</Label>
                                        <Input value={form.notification_channel} onChange={e => setForm({...form, notification_channel: e.target.value})} placeholder="email, in_app, webhook" />
                                    </div>
                                </div>
                                <DialogFooter><Button type="submit">Create</Button></DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="space-y-2">
                    {rules.map(rule => (
                        <Card key={rule.id}>
                            <CardHeader className="py-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <button onClick={() => toggleRule(rule)}>
                                            {rule.enabled ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5 text-muted-foreground" />}
                                        </button>
                                        <div>
                                            <CardTitle className="text-sm">{rule.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">
                                                {rule.entity.name} ({rule.entity.device.name})
                                                {rule.entity.device.zone?.farm?.name && ` · ${rule.entity.device.zone.farm.name}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">{rule.condition_operator} {rule.threshold_value}</Badge>
                                        <Badge>{rule.severity}</Badge>
                                        {rule.notification_channel && (
                                            <span className="text-xs text-muted-foreground">{rule.notification_channel}</span>
                                        )}
                                    </div>
                                </div>
                            </CardHeader>
                        </Card>
                    ))}
                </div>
                {rules.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">No alert rules configured.</p>
                )}
            </div>
        </>
    );
}
