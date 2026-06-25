<?php

namespace App\Services;

use App\Models\Device;
use App\Models\Entity;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;

class EspHomeService
{
    private const API_PORT = 6053;

    private int $timeout = 5;

    public function setTimeout(int $seconds): static
    {
        $this->timeout = $seconds;

        return $this;
    }

    /** @return Collection<int, array<string, mixed>> */
    public function discover(string $subnet = '192.168.1'): Collection
    {
        $discovered = collect();

        for ($host = 1; $host <= 254; $host++) {
            $ip = "{$subnet}.{$host}";

            $info = $this->probeDevice($ip);

            if ($info !== null) {
                $discovered->push($info);
            }
        }

        return $discovered;
    }

    /** @return array<string, mixed>|null */
    public function probeDevice(string $ip): ?array
    {
        try {
            $infoResponse = Http::timeout($this->timeout)
                ->get("http://{$ip}:".self::API_PORT.'/api/info');

            if ($infoResponse->failed()) {
                return null;
            }

            $info = $infoResponse->json();

            if (empty($info) || empty($info['name'] ?? null)) {
                return null;
            }

            $configResponse = Http::timeout($this->timeout)
                ->get("http://{$ip}:".self::API_PORT.'/api/config');

            $config = $configResponse->successful() ? ($configResponse->json() ?? []) : [];

            $statesResponse = Http::timeout($this->timeout)
                ->get("http://{$ip}:".self::API_PORT.'/api/states');

            $states = $statesResponse->successful() ? ($statesResponse->json() ?? []) : [];

            $entities = [];
            foreach ($states as $entityId => $stateData) {
                $attrs = $stateData['attributes'] ?? [];
                $entities[] = [
                    'entity_id' => $entityId,
                    'name' => $attrs['friendly_name'] ?? $entityId,
                    'entity_type' => $this->inferEntityType($entityId),
                    'unit' => $attrs['unit_of_measurement'] ?? null,
                    'device_class' => $attrs['device_class'] ?? null,
                    'state_class' => $attrs['state_class'] ?? null,
                    'icon' => $attrs['icon'] ?? null,
                    'value' => $stateData['state'] ?? null,
                ];
            }

            return [
                'ip_address' => $ip,
                'name' => $info['friendly_name'] ?? $info['name'],
                'esphome_node' => $info['name'],
                'friendly_name' => $info['friendly_name'] ?? null,
                'mac_address' => $info['mac'] ?? null,
                'device_type' => $config['esphome']['platform'] ?? 'ESP32',
                'manufacturer' => 'ESPHome',
                'firmware_version' => $info['version'] ?? null,
                'platform' => $info['platform'] ?? $config['esphome']['board'] ?? null,
                'entities' => $entities,
            ];
        } catch (ConnectionException) {
            return null;
        } catch (\Exception) {
            return null;
        }
    }

    /** @param array<string, mixed> $deviceData */
    public function registerDevice(array $deviceData): Device
    {
        $device = Device::firstOrCreate(
            ['esphome_node' => $deviceData['esphome_node']],
            [
                'name' => $deviceData['name'],
                'friendly_name' => $deviceData['friendly_name'] ?? null,
                'mac_address' => $deviceData['mac_address'] ?? null,
                'ip_address' => $deviceData['ip_address'],
                'device_type' => $deviceData['device_type'] ?? 'ESP32',
                'manufacturer' => $deviceData['manufacturer'] ?? 'ESPHome',
                'firmware_version' => $deviceData['firmware_version'] ?? null,
                'status' => 'online',
                'last_seen' => now(),
            ],
        );

        if ($device->wasRecentlyCreated === false) {
            $device->update([
                'ip_address' => $deviceData['ip_address'],
                'status' => 'online',
                'last_seen' => now(),
                'firmware_version' => $deviceData['firmware_version'] ?? $device->firmware_version,
            ]);
        }

        if (! empty($deviceData['entities'])) {
            foreach ($deviceData['entities'] as $entityData) {
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

        return $device->fresh(['entities']);
    }

    private function inferEntityType(string $entityId): string
    {
        $prefix = explode('.', $entityId)[0];

        return match ($prefix) {
            'binary_sensor' => 'binary_sensor',
            'switch' => 'switch',
            'sensor' => 'sensor',
            'number' => 'number',
            'button' => 'button',
            'select' => 'select',
            'light' => 'light',
            'fan' => 'fan',
            'valve' => 'valve',
            'pump' => 'pump',
            'climate' => 'sensor',
            'cover' => 'switch',
            'lock' => 'binary_sensor',
            default => 'sensor',
        };
    }
}
