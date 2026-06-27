<?php

namespace App\Services;

use App\Models\Device;
use App\Models\Entity;
use App\Models\EntityState;
use Illuminate\Support\Collection;

class EspHomeService
{
    private const API_PORT = 6053;

    private const WEB_PORT = 80;

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

        /** @var array<string, mixed> $info */
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

        $this->probeViaSSE($ip, $info);

        if (empty($info['entities'])) {
            $this->probeViaWebServer($ip, $info);
        }

        return $info;
    }

    /** @param array<string, mixed> $info */
    private function probeViaSSE(string $ip, array &$info): void
    {
        $fp = @stream_socket_client("tcp://{$ip}:".self::WEB_PORT, $errno, $errstr, 3);
        if ($fp === false) {
            return;
        }

        stream_set_timeout($fp, 3);
        $request = "GET /events HTTP/1.1\r\nHost: {$ip}:".self::WEB_PORT."\r\nAccept: text/event-stream\r\nConnection: close\r\n\r\n";
        fwrite($fp, $request);

        $data = '';
        while (! feof($fp)) {
            $chunk = fread($fp, 8192);
            if ($chunk === false || $chunk === '') {
                break;
            }
            $data .= $chunk;
            if (strlen($data) > 16384) {
                break;
            }
        }
        fclose($fp);

        $bodyStart = strpos($data, "\r\n\r\n");
        if ($bodyStart !== false) {
            $data = substr($data, $bodyStart + 4);
        }

        $data = $this->decodeChunked($data);
        $data = str_replace("\r\n", "\n", $data);

        if ($data === '' || ! str_contains($data, 'event:')) {
            return;
        }

        $events = explode("\n\n", $data);
        foreach ($events as $event) {
            $event = trim($event);
            if ($event === '') {
                continue;
            }

            $lines = explode("\n", $event);
            $eventType = '';
            $eventData = '';

            foreach ($lines as $line) {
                if (str_starts_with($line, 'event: ')) {
                    $eventType = substr($line, 7);
                } elseif (str_starts_with($line, 'data: ')) {
                    $eventData = substr($line, 6);
                }
            }

            if ($eventData === '') {
                continue;
            }

            $payload = json_decode($eventData, true);
            if (! is_array($payload)) {
                continue;
            }

            if ($eventType === 'ping' && isset($payload['title'])) {
                $info['name'] = $payload['title'];
                $info['friendly_name'] = $payload['title'];
            } elseif ($eventType === 'state' && isset($payload['id'])) {
                $entityId = $payload['id'];
                $existingIndex = null;
                foreach ($info['entities'] as $idx => $e) {
                    if ($e['entity_id'] === $entityId) {
                        $existingIndex = $idx;
                        break;
                    }
                }

                $attributes = [];
                if (isset($payload['option']) && is_array($payload['option'])) {
                    $attributes['option'] = $payload['option'];
                }

                $entityData = [
                    'entity_id' => $entityId,
                    'name' => $payload['name'] ?? $entityId,
                    'entity_type' => $this->inferEntityType($entityId),
                    'unit' => $payload['unit'] ?? null,
                    'device_class' => null,
                    'state_class' => null,
                    'icon' => null,
                    'value' => $payload['value'] ?? null,
                    'attributes' => $attributes !== [] ? $attributes : null,
                ];

                if ($existingIndex !== null) {
                    $info['entities'][$existingIndex]['value'] = $payload['value'] ?? $info['entities'][$existingIndex]['value'];
                } else {
                    $info['entities'][] = $entityData;
                }
            }
        }
    }

    /** @param array<string, mixed> $info */
    private function probeViaWebServer(string $ip, array &$info): void
    {
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
                $entity = Entity::firstOrCreate(
                    ['device_id' => $device->id, 'entity_id' => $entityData['entity_id']],
                    [
                        'name' => $entityData['name'],
                        'entity_type' => $entityData['entity_type'] ?? 'sensor',
                        'unit' => $entityData['unit'] ?? null,
                        'device_class' => $entityData['device_class'] ?? null,
                        'state_class' => $entityData['state_class'] ?? null,
                        'icon' => $entityData['icon'] ?? null,
                        'attributes' => $entityData['attributes'] ?? null,
                    ],
                );

                if ($entity->wasRecentlyCreated === false && ! empty($entityData['attributes'])) {
                    $entity->update(['attributes' => $entityData['attributes']]);
                }

                if (isset($entityData['value'])) {
                    EntityState::create([
                        'entity_id' => $entity->id,
                        'value' => (string) $entityData['value'],
                        'recorded_at' => now(),
                    ]);
                }
            }
        }

        return $device->fresh(['entities.latestState']);
    }

    private function inferEntityType(string $entityId): string
    {
        $prefix = str_contains($entityId, '-') ? explode('-', $entityId)[0] : explode('.', $entityId)[0];

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

    private function decodeChunked(string $data): string
    {
        if (! preg_match('/^[0-9a-fA-F]+\r\n/', $data)) {
            return $data;
        }

        $decoded = '';
        while ($data !== '') {
            $pos = strpos($data, "\r\n");
            if ($pos === false) {
                break;
            }

            $hexSize = trim(substr($data, 0, $pos));
            $size = (int) hexdec($hexSize);

            if ($size === 0) {
                break;
            }

            $data = substr($data, $pos + 2);
            $decoded .= substr($data, 0, $size);
            $data = substr($data, $size + 2);
        }

        return $decoded;
    }
}
