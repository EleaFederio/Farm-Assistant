<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\Entity;
use App\Models\Zone;
use App\Services\EspHomeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    public function index(): Response
    {
        $devices = Device::with(['zone.farm', 'entities'])
            ->latest()
            ->get();

        return Inertia::render('devices/index', [
            'devices' => $devices,
            'zones' => Zone::with('farm')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'zone_id' => 'nullable|exists:zones,id',
            'name' => 'required|string|max:255',
            'device_type' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'esphome_node' => 'nullable|string|max:255|unique:devices',
            'mqtt_topic' => 'nullable|string|max:255',
            'ip_address' => 'nullable|string|max:45',
            'firmware_version' => 'nullable|string|max:50',
            'mac_address' => 'nullable|string|max:17|unique:devices',
            'friendly_name' => 'nullable|string|max:255',
        ]);

        Device::create($validated);

        return redirect()->route('devices.index');
    }

    public function show(Device $device): Response
    {
        $device->load(['zone.farm', 'entities.latestState']);

        return Inertia::render('devices/show', [
            'device' => $device,
        ]);
    }

    public function update(Request $request, Device $device): RedirectResponse
    {
        $validated = $request->validate([
            'zone_id' => 'nullable|exists:zones,id',
            'name' => 'required|string|max:255',
            'device_type' => 'nullable|string|max:255',
            'status' => 'required|string|in:online,offline,disconnected,error,updating',
        ]);

        $device->update($validated);

        return redirect()->route('devices.show', $device);
    }

    public function disconnect(Device $device): RedirectResponse
    {
        $device->update([
            'status' => 'disconnected',
            'last_seen' => null,
        ]);

        return redirect()->route('devices.show', $device);
    }

    public function destroy(Device $device): RedirectResponse
    {
        $device->delete();

        return redirect()->route('devices.index');
    }

    public function discover(Request $request): Response
    {
        $subnet = $request->get('subnet', $this->guessSubnet());

        return Inertia::render('devices/discover', [
            'discoveredDevices' => [],
            'subnet' => $subnet,
        ]);
    }

    public function scan(Request $request, EspHomeService $esphome): JsonResponse
    {
        $subnet = $request->get('subnet', $this->guessSubnet());

        $discovered = $esphome->discover($subnet);

        return response()->json([
            'discoveredDevices' => $discovered->values()->all(),
            'subnet' => $subnet,
        ]);
    }

    public function probe(Request $request, EspHomeService $esphome): JsonResponse
    {
        $validated = $request->validate([
            'ip_address' => 'required|string|ip',
        ]);

        $deviceInfo = $esphome->probeDevice($validated['ip_address']);

        if ($deviceInfo === null) {
            return response()->json(['error' => 'No ESPHome device found at this IP'], 404);
        }

        return response()->json($deviceInfo);
    }

    public function register(Request $request, EspHomeService $esphome): RedirectResponse
    {
        $validated = $request->validate([
            'ip_address' => 'required|string',
            'name' => 'required|string|max:255',
            'esphome_node' => 'required|string|max:255',
            'friendly_name' => 'nullable|string|max:255',
            'mac_address' => 'nullable|string|max:17',
            'device_type' => 'nullable|string|max:255',
            'manufacturer' => 'nullable|string|max:255',
            'firmware_version' => 'nullable|string|max:50',
            'zone_id' => 'nullable|exists:zones,id',
            'entities' => 'nullable|array',
            'entities.*.entity_id' => 'required_with:entities|string',
            'entities.*.name' => 'required_with:entities|string',
            'entities.*.entity_type' => 'nullable|string',
            'entities.*.unit' => 'nullable|string',
            'entities.*.device_class' => 'nullable|string',
            'entities.*.state_class' => 'nullable|string',
            'entities.*.icon' => 'nullable|string',
        ]);

        $device = Device::firstOrCreate(
            ['esphome_node' => $validated['esphome_node']],
            [
                'name' => $validated['name'],
                'friendly_name' => $validated['friendly_name'] ?? null,
                'mac_address' => $validated['mac_address'] ?? null,
                'ip_address' => $validated['ip_address'],
                'device_type' => $validated['device_type'] ?? 'ESP32',
                'manufacturer' => $validated['manufacturer'] ?? 'ESPHome',
                'firmware_version' => $validated['firmware_version'] ?? null,
                'zone_id' => $validated['zone_id'] ?? null,
                'status' => 'online',
                'last_seen' => now(),
            ],
        );

        if ($device->wasRecentlyCreated === false) {
            $device->update([
                'ip_address' => $validated['ip_address'],
                'status' => 'online',
                'last_seen' => now(),
                'zone_id' => $validated['zone_id'] ?? $device->zone_id,
            ]);
        }

        if (! empty($validated['entities'])) {
            foreach ($validated['entities'] as $entityData) {
                Entity::firstOrCreate(
                    ['device_id' => $device->id, 'entity_id' => $entityData['entity_id']],
                    [
                        'name' => $entityData['name'],
                        'entity_type' => $entityData['entity_type'] ?? 'sensor',
                        'unit' => $entityData['unit'] ?? null,
                        'device_class' => $entityData['device_class'] ?? null,
                        'state_class' => $entityData['state_class'] ?? null,
                        'icon' => $entityData['icon'] ?? null,
                    ],
                );
            }
        }

        return redirect()->route('devices.show', $device);
    }

    private function guessSubnet(): string
    {
        $host = gethostname();
        $ips = $host ? gethostbyname($host) : '127.0.0.1';

        if ($ips !== $host && $ips !== '127.0.0.1') {
            $parts = explode('.', $ips);
            array_pop($parts);

            return implode('.', $parts);
        }

        return '192.168.1';
    }
}
