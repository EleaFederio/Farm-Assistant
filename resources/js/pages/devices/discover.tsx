import { Head, Link, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Search,
    Wifi,
    WifiOff,
    Cpu,
    Plus,
    Check,
    Loader2,
    RefreshCw,
    Settings,
} from 'lucide-react';
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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import Heading from '@/components/heading';

type DiscoveredEntity = {
    entity_id: string;
    name: string;
    entity_type: string;
    unit: string | null;
    device_class: string | null;
    icon: string | null;
    value: string | null;
};

type DiscoveredDevice = {
    ip_address: string;
    name: string;
    esphome_node: string;
    friendly_name: string | null;
    mac_address: string | null;
    device_type: string;
    manufacturer: string;
    firmware_version: string | null;
    platform: string | null;
    entities: DiscoveredEntity[];
};

type Props = {
    discoveredDevices: DiscoveredDevice[];
    subnet: string;
};

type ProbeResult = DiscoveredDevice & { already_registered?: boolean };

export default function DeviceDiscover({ discoveredDevices, subnet }: Props) {
    const [scanning, setScanning] = useState(false);
    const [scanProgress, setScanProgress] = useState(0);
    const [scanStatus, setScanStatus] = useState('');
    const [devices, setDevices] = useState<DiscoveredDevice[]>(discoveredDevices);
    const [currentSubnet, setCurrentSubnet] = useState(subnet);
    const [configureOpen, setConfigureOpen] = useState(false);
    const [selectedDevice, setSelectedDevice] = useState<ProbeResult | null>(null);
    const [probingIp, setProbingIp] = useState('');
    const [confirming, setConfirming] = useState(false);

    // Simulate scan progress
    useEffect(() => {
        if (!scanning) return;

        const progressInterval = setInterval(() => {
            setScanProgress(prev => {
                if (prev >= 90) return 90; // Cap at 90% until complete
                return prev + Math.random() * 15;
            });
        }, 500);

        return () => clearInterval(progressInterval);
    }, [scanning]);

    // Reset progress when scanning stops
    useEffect(() => {
        if (!scanning) {
            setScanProgress(0);
        }
    }, [scanning]);

    const startScan = () => {
        setScanning(true);
        setScanStatus('Scanning network...');
        setScanProgress(0);
        router.get('/devices/discover', { subnet: currentSubnet }, {
            preserveState: true,
            onSuccess: (page: any) => {
                setDevices(page.props.discoveredDevices as DiscoveredDevice[]);
                setScanProgress(100);
                setScanStatus(`Found ${(page.props.discoveredDevices as DiscoveredDevice[]).length} device(s)`);
                setTimeout(() => {
                    setScanning(false);
                    setScanStatus('');
                }, 500);
            },
            onError: () => {
                setScanStatus('Scan failed');
                setTimeout(() => {
                    setScanning(false);
                    setScanStatus('');
                }, 1000);
            },
        });
    };

    const probeIp = () => {
        if (!probingIp) return;
        setScanning(true);
        setScanStatus(`Connecting to ${probingIp}...`);
        setScanProgress(0);
        router.post('/devices/probe', { ip_address: probingIp }, {
            preserveState: true,
            onSuccess: (page: any) => {
                const result = { ...page.props.flash?.probeResult, already_registered: false } as ProbeResult;
                setSelectedDevice(result);
                setScanProgress(100);
                setScanStatus('Device found!');
                setTimeout(() => {
                    setConfigureOpen(true);
                    setScanning(false);
                    setScanStatus('');
                }, 500);
            },
            onError: () => {
                alert('No ESPHome device found at this IP address');
                setScanStatus('Connection failed');
                setTimeout(() => {
                    setScanning(false);
                    setScanStatus('');
                }, 1000);
            },
        });
    };

    const openConfigure = (device: DiscoveredDevice) => {
        const existing = device as ProbeResult;
        existing.already_registered = false;
        setSelectedDevice(existing);
        setProbingIp(device.ip_address);
        setConfigureOpen(true);
    };

    const confirmAdd = () => {
        if (!selectedDevice) return;
        setConfirming(true);

        const formData = {
            ip_address: selectedDevice.ip_address,
            name: selectedDevice.name,
            esphome_node: selectedDevice.esphome_node,
            friendly_name: selectedDevice.friendly_name,
            mac_address: selectedDevice.mac_address,
            device_type: selectedDevice.device_type,
            manufacturer: selectedDevice.manufacturer,
            firmware_version: selectedDevice.firmware_version,
            entities: selectedDevice.entities.map(e => ({
                entity_id: e.entity_id,
                name: e.name,
                entity_type: e.entity_type,
                unit: e.unit,
                device_class: e.device_class,
                state_class: null,
                icon: null,
            })),
        };

        router.post('/devices/register', formData, {
            onSuccess: () => {
                setConfirming(false);
                setConfigureOpen(false);
                setSelectedDevice(null);
            },
            onError: () => {
                setConfirming(false);
                alert('Failed to register device');
            },
        });
    };

    const entityIcon = (type: string) => {
        const icons: Record<string, string> = {
            sensor: '📊',
            binary_sensor: '🔲',
            switch: '🔘',
            number: '#️⃣',
            button: '🔴',
            select: '📋',
            light: '💡',
            fan: '🌀',
            valve: '🔧',
            pump: '💧',
        };
        return icons[type] ?? '📡';
    };

    return (
        <>
            <Head title="Discover ESPHome Devices" />
            <div className="flex h-full flex-1 flex-col gap-4 p-4">
                <div className="flex items-center gap-4">
                    <Link href="/devices">
                        <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
                    </Link>
                    <Heading title="Discover ESPHome Devices" description="Find ESPHome devices on your network like in Home Assistant" />
                </div>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-end gap-3">
                            <div className="flex-1">
                                <Label htmlFor="subnet">Network Subnet</Label>
                                <Input
                                    id="subnet"
                                    value={currentSubnet}
                                    onChange={e => setCurrentSubnet(e.target.value)}
                                    placeholder="192.168.1"
                                    className="mt-1"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Scans IPs from {currentSubnet}.1 to {currentSubnet}.254
                                </p>
                            </div>
                            <Button onClick={startScan} disabled={scanning}>
                                {scanning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                                {scanning ? 'Scanning...' : 'Scan Network'}
                            </Button>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-xs text-muted-foreground">OR</span>
                            <div className="h-px flex-1 bg-border" />
                        </div>

                        <div className="mt-4 flex items-end gap-3">
                            <div className="flex-1">
                                <Label htmlFor="probe-ip">Connect by IP Address</Label>
                                <Input
                                    id="probe-ip"
                                    value={probingIp}
                                    onChange={e => setProbingIp(e.target.value)}
                                    placeholder="192.168.1.100"
                                    className="mt-1"
                                />
                            </div>
                            <Button variant="secondary" onClick={probeIp} disabled={scanning || !probingIp}>
                                <Cpu className="mr-2 h-4 w-4" /> Connect
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {devices.length > 0 && (
                    <div>
                        <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                            <Wifi className="h-5 w-5 text-green-500" />
                            Discovered Devices ({devices.length})
                        </h3>
                        <div className="space-y-3">
                            {devices.map((device, idx) => (
                                <Card key={idx} className="transition-colors hover:border-primary/50">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-3">
                                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                                    <Cpu className="h-5 w-5 text-primary" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-base">
                                                        {device.friendly_name ?? device.name}
                                                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                            ({device.esphome_node})
                                                        </span>
                                                    </CardTitle>
                                                    <p className="text-sm text-muted-foreground">
                                                        {device.ip_address}
                                                        {device.mac_address && ` · ${device.mac_address}`}
                                                    </p>
                                                </div>
                                            </div>
                                            <Button onClick={() => openConfigure(device)} size="sm">
                                                <Settings className="mr-2 h-4 w-4" /> Configure
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <Badge variant="secondary" className="text-xs">{device.device_type}</Badge>
                                            <Badge variant="outline" className="text-xs">{device.firmware_version ?? '?'}</Badge>
                                            <Badge variant="outline" className="text-xs">{device.entities.length} entities</Badge>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-1">
                                            {device.entities.slice(0, 8).map(e => (
                                                <span key={e.entity_id} className="inline-flex items-center gap-1 rounded-md bg-muted px-2 py-0.5 text-xs">
                                                    {entityIcon(e.entity_type)} {e.name}
                                                    {e.value !== null && <span className="font-mono text-primary">{e.value}{e.unit ?? ''}</span>}
                                                </span>
                                            ))}
                                            {device.entities.length > 8 && (
                                                <span className="text-xs text-muted-foreground">+{device.entities.length - 8} more</span>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {!scanning && devices.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-16">
                        <WifiOff className="h-12 w-12 text-muted-foreground/40" />
                        <p className="text-muted-foreground">No ESPHome devices discovered</p>
                        <p className="text-sm text-muted-foreground">
                            Make sure your ESPHome devices are on the same network and the native API is enabled
                        </p>
                    </div>
                )}

                <Dialog open={scanning} onOpenChange={(open) => {
                    if (!open) setScanning(false);
                }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                                Finding ESPHome Devices
                            </DialogTitle>
                            <DialogDescription>
                                {scanStatus || 'Please wait...'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">Progress</span>
                                    <span className="text-muted-foreground">{Math.round(scanProgress)}%</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                                    <div
                                        className="h-full bg-primary transition-all duration-300 ease-out"
                                        style={{ width: `${scanProgress}%` }}
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100">
                                <p className="flex items-start gap-2">
                                    <Wifi className="mt-0.5 h-4 w-4 flex-shrink-0" />
                                    <span>Scanning your network for ESPHome devices. This may take a moment...</span>
                                </p>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>

                <Dialog open={configureOpen} onOpenChange={setConfigureOpen}>
                    <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
                        {selectedDevice && (
                            <>
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Cpu className="h-5 w-5 text-primary" />
                                        Configure {selectedDevice.friendly_name ?? selectedDevice.name}
                                    </DialogTitle>
                                    <DialogDescription>
                                        {selectedDevice.ip_address} · {selectedDevice.esphome_node}
                                        {selectedDevice.mac_address && ` · ${selectedDevice.mac_address}`}
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                    <div className="rounded-lg border p-3">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <Check className="h-4 w-4 text-green-500" />
                                            Device Info
                                        </div>
                                        <div className="mt-1 grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                                            <span>Platform: {selectedDevice.device_type}</span>
                                            <span>Firmware: {selectedDevice.firmware_version ?? '?'}</span>
                                            <span>Manufacturer: {selectedDevice.manufacturer}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="mb-2 text-sm font-medium">
                                            Entities ({selectedDevice.entities.length})
                                        </h4>
                                        <div className="space-y-1">
                                            {selectedDevice.entities.map(e => (
                                                <div key={e.entity_id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <span>{entityIcon(e.entity_type)}</span>
                                                        <div>
                                                            <p className="text-sm font-medium">{e.name}</p>
                                                            <p className="text-xs text-muted-foreground">{e.entity_id}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">{e.entity_type}</Badge>
                                                        {e.value !== null && (
                                                            <span className="font-mono text-sm">{e.value}{e.unit ?? ''}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="gap-2">
                                    <Button variant="outline" onClick={() => setConfigureOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button onClick={confirmAdd} disabled={confirming}>
                                        {confirming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                                        {confirming ? 'Adding...' : 'Add Device'}
                                    </Button>
                                </DialogFooter>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
}

DeviceDiscover.layout = (props: any) => ({
    breadcrumbs: [
        { title: 'Devices', href: '/devices' },
        { title: 'Discover', href: '/devices/discover' },
    ],
});
