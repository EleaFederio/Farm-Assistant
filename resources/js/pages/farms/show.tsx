import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Heading from '@/components/heading';

type Props = {
    farm: {
        id: number;
        name: string;
        location: string | null;
        description: string | null;
        zones: Array<{
            id: number;
            name: string;
            type: string | null;
            devices_count?: number;
            crop_cycles_count?: number;
            devices: Array<any>;
            crop_cycles: Array<any>;
        }>;
    };
};

export default function FarmsShow({ farm }: Props) {
    return (
        <>
            <Head title={farm.name} />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/farms">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <Heading title={farm.name} description={farm.location ?? ''} />
                </div>

                {farm.description && (
                    <p className="text-muted-foreground">{farm.description}</p>
                )}

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {farm.zones.map(zone => (
                        <Card key={zone.id}>
                            <CardHeader>
                                <CardTitle className="text-lg">
                                    {zone.name}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Type: {zone.type ?? 'General'}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Devices: {zone.devices?.length ?? 0}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Crop Cycles: {zone.crop_cycles?.length ?? 0}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {farm.zones.length === 0 && (
                    <p className="py-8 text-center text-muted-foreground">
                        No zones yet. Zones are added automatically when you create crop cycles or install devices.
                    </p>
                )}
            </div>
        </>
    );
}

FarmsShow.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Farms', href: '/farms' },
        { title: props.farm?.name ?? 'Farm', href: `/farms/${props.farm?.id}` },
    ],
});
