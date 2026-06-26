<?php

namespace App\Services;

use App\Models\Device;
use App\Models\Entity;
use Illuminate\Support\Collection;

class EspHomeService
{
    private const API_PORT = 6053;

    private int $timeout = 2;

    public function setTimeout(int $seconds): static
    {
        $this->timeout = $seconds;

        return $this;
    }

    /** @return Collection<int, array<string, mixed>> */
    public function discover(string $subnet = '192.168.1'): Collection
    {
        $ips = $this->buildSubnetIps($subnet);
        $found = collect();

        $sockets = [];
        foreach ($ips as $ip) {
            $ctx = stream_context_create(['socket' => ['tcp_nodelay' => true]]);
            $fp = @stream_socket_client("tcp://{$ip}:".self::API_PORT, $errno, $errstr, 0.5, STREAM_CLIENT_CONNECT | STREAM_CLIENT_ASYNC_CONNECT, $ctx);
            if ($fp !== false) {
                $sockets[$ip] = $fp;
            }
        }

        if ($sockets !== []) {
            $write = $except = null;
            stream_select($sockets, $write, $except, 1);

            foreach ($sockets as $ip => $fp) {
                $meta = stream_get_meta_data($fp);
                if (! $meta['timed_out'] && ! $meta['eof']) {
                    $found->push([
                        'ip_address' => $ip,
                        'name' => $ip,
                        'esphome_node' => $ip,
                    ]);
                }
                fclose($fp);
            }
        }

        return $found;
    }

    /** @return array<int, string> */
    private function buildSubnetIps(string $subnet): array
    {
        $ips = [];
        for ($host = 1; $host <= 254; $host++) {
            $ips[] = "{$subnet}.{$host}";
        }

        return $ips;
    }

    /** @return array<string, mixed>|null */
    public function probeDevice(string $ip): ?array
    {
        $fp = @stream_socket_client(
            "tcp://{$ip}:".self::API_PORT,
            $errno,
            $errstr,
            $this->timeout,
        );

        if ($fp === false) {
            return null;
        }
        fclose($fp);

        $info = [
            'ip_address' => $ip,
            'name' => $ip,
            'esphome_node' => $ip,
            'friendly_name' => null,
            'mac_address' => null,
            'device_type' => 'ESP32',
            'manufacturer' => 'ESPHome',
            'firmware_version' => null,
            'platform' => null,
            'entities' => [],
        ];

        try {
            $response = @file_get_contents("http://{$ip}:80/json", false, stream_context_create([
                'http' => ['timeout' => 2],
            ]));

            if ($response !== false) {
                $json = json_decode($response, true);
                if (is_array($json)) {
                    $info['entities'] = array_map(function (array $entity) {
                        return [
                            'entity_id' => $entity['id'] ?? $entity['key'] ?? 'unknown',
                            'name' => $entity['name'] ?? $entity['id'] ?? 'Unknown',
                            'entity_type' => $this->inferEntityType($entity['id'] ?? ''),
                            'unit' => $entity['unit'] ?? null,
                            'device_class' => null,
                            'state_class' => null,
                            'icon' => null,
                            'value' => $entity['value'] ?? null,
                        ];
                    }, $json);
                }
            }
        } catch (\Exception) {
            // web_server not available, that's fine
        }

        return $info;
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
