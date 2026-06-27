<?php

namespace App\Http\Controllers;

use App\Models\Entity;
use App\Models\EntityState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EntityCommandController extends Controller
{
    public function command(Request $request, Entity $entity): JsonResponse
    {
        $validated = $request->validate([
            'value' => 'required|string',
        ]);

        $device = $entity->device;

        if ($device->ip_address === null) {
            return response()->json(['error' => 'Device has no IP address'], 422);
        }

        $componentId = $this->extractComponentId($entity->entity_id, $entity->entity_type);
        $baseUrl = "http://{$device->ip_address}";

        $success = match ($entity->entity_type) {
            'switch' => $this->sendSwitchCommand($baseUrl, $componentId, $validated['value']),
            'select' => $this->sendSelectCommand($baseUrl, $componentId, $validated['value']),
            'number' => $this->sendNumberCommand($baseUrl, $componentId, $validated['value']),
            'button' => $this->sendButtonCommand($baseUrl, $componentId),
            'light' => $this->sendLightCommand($baseUrl, $componentId, $validated['value']),
            'fan' => $this->sendFanCommand($baseUrl, $componentId, $validated['value']),
            default => false,
        };

        if ($success) {
            EntityState::create([
                'entity_id' => $entity->id,
                'value' => $validated['value'],
                'attributes' => null,
                'recorded_at' => now(),
            ]);

            $entity->update(['enabled' => true]);
            $device->update(['last_seen' => now()]);

            return response()->json(['status' => 'ok']);
        }

        return response()->json(['error' => 'Failed to send command to device'], 502);
    }

    private function extractComponentId(string $entityId, string $entityType): string
    {
        $prefix = $entityType.'-';
        if (str_starts_with($entityId, $prefix)) {
            return substr($entityId, strlen($prefix));
        }

        return $entityId;
    }

    private function sendSwitchCommand(string $baseUrl, string $componentId, string $value): bool
    {
        $action = match (strtoupper($value)) {
            'ON' => 'turn_on',
            'OFF' => 'turn_off',
            default => 'toggle',
        };

        $url = "{$baseUrl}/switch/{$componentId}/{$action}";

        return $this->httpPost($url);
    }

    private function sendSelectCommand(string $baseUrl, string $componentId, string $value): bool
    {
        $url = "{$baseUrl}/select/{$componentId}/set?option=".urlencode($value);

        return $this->httpPost($url);
    }

    private function sendNumberCommand(string $baseUrl, string $componentId, string $value): bool
    {
        $url = "{$baseUrl}/number/{$componentId}/set?value=".urlencode($value);

        return $this->httpPost($url);
    }

    private function sendButtonCommand(string $baseUrl, string $componentId): bool
    {
        $url = "{$baseUrl}/button/{$componentId}/press";

        return $this->httpPost($url);
    }

    private function sendLightCommand(string $baseUrl, string $componentId, string $value): bool
    {
        $action = match (strtoupper($value)) {
            'ON' => 'turn_on',
            'OFF' => 'turn_off',
            default => 'toggle',
        };

        $url = "{$baseUrl}/light/{$componentId}/{$action}";

        return $this->httpPost($url);
    }

    private function sendFanCommand(string $baseUrl, string $componentId, string $value): bool
    {
        $action = match (strtoupper($value)) {
            'ON' => 'turn_on',
            'OFF' => 'turn_off',
            default => 'toggle',
        };

        $url = "{$baseUrl}/fan/{$componentId}/{$action}";

        return $this->httpPost($url);
    }

    private function httpPost(string $url): bool
    {
        $fp = @stream_socket_client(
            parse_url($url, PHP_URL_HOST).':'.(parse_url($url, PHP_URL_PORT) ?? 80),
            $errno,
            $errstr,
            3,
        );

        if ($fp === false) {
            return false;
        }

        $parsed = parse_url($url);
        $path = $parsed['path'] ?? '/';
        if (isset($parsed['query'])) {
            $path .= '?'.$parsed['query'];
        }
        $host = $parsed['host'] ?? '';

        stream_set_timeout($fp, 3);
        $request = "POST {$path} HTTP/1.1\r\nHost: {$host}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n";
        fwrite($fp, $request);

        $response = '';
        while (! feof($fp)) {
            $chunk = fread($fp, 4096);
            if ($chunk === false || $chunk === '') {
                break;
            }
            $response .= $chunk;
        }
        fclose($fp);

        return str_contains($response, '200');
    }
}
