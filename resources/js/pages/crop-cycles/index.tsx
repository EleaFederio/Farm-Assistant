import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';

const statusColors: Record<string, string> = {
    planned: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    active: 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100',
    growing: 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100',
    harvesting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100',
    completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-800 dark:text-emerald-100',
    failed: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100',
};

type Props = {
    cycles: Array<{
        id: number;
        name: string;
        quantity: number;
        status: string;
        start_date: string | null;
        expected_harvest_date: string | null;
        crop: { id: number; name: string };
        zone: { id: number; name: string; farm: { id: number; name: string } };
    }>;
};

export default function CropCyclesIndex({ cycles }: Props) {
    return (
        <>
            <Head title="Crop Cycles" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <Heading title="Crop Cycles" description="Track planting and harvest cycles" />
                    <Link href="/crop-cycles/create">
                        <Button><Plus className="mr-2 h-4 w-4" /> New Cycle</Button>
                    </Link>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cycles.map(cycle => (
                        <Link key={cycle.id} href={`/crop-cycles/${cycle.id}`}>
                            <Card className="cursor-pointer transition-colors hover:bg-accent/50">
                                <CardHeader>
                                    <CardTitle className="flex items-center justify-between text-lg">
                                        {cycle.name}
                                        <Badge className={statusColors[cycle.status]}>
                                            {cycle.status}
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Crop: {cycle.crop.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Zone: {cycle.zone.name} ({cycle.zone.farm.name})
                                    </p>
                                    {cycle.quantity > 0 && (
                                        <p className="text-sm text-muted-foreground">
                                            Quantity: {cycle.quantity}
                                        </p>
                                    )}
                                    {cycle.start_date && (
                                        <p className="text-sm text-muted-foreground">
                                            Started: {cycle.start_date}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
                {cycles.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                        No crop cycles yet.
                    </p>
                )}
            </div>
        </>
    );
}
