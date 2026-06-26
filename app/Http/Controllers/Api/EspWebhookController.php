<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessEntityState;
use App\Models\Device;
use App\Models\Entity;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EspWebhookController extends Controller
{
    public function ingest(Request $request): JsonResponse
    {
        $flat = $request->validate([
            'device' => 'required_without:entities|string',
            'entities' => 'required_without:device|array',
            'entity_id' => 'required_with:device|string',
            'value' => 'required_with:device|string',
            'unit' => 'nullable|string',
            'device_class' => 'nullable|string',
            'entity_type' => 'nullable|string',
            'entities.*.entity_id' => 'required|string',
            'entities.*.value' => 'required|string',
            'entities.*.unit' => 'nullable|string',
            'entities.*.device_class' => 'nullable|string',
            'entities.*.entity_type' => 'nullable|string',
        ]);

        $nodeName = $flat['device'] ?? 'unknown';

        $device = Device::firstOrCreate(
            ['esphome_node' => $nodeName],
            ['name' => $nodeName, 'status' => 'online'],
        );

        $device->update(['status' => 'online', 'last_seen' => now()]);

        if (isset($flat['entity_id']) && isset($flat['value'])) {
            $entities = [[$flat]];
        } else {
            $entities = [$flat['entities']];
        }

        foreach ($entities[0] as $entityData) {
            $entity = Entity::firstOrCreate(
                ['device_id' => $device->id, 'entity_id' => $entityData['entity_id']],
                [
                    'name' => $entityData['entity_id'],
                    'entity_type' => $entityData['entity_type'] ?? 'sensor',
                    'unit' => $entityData['unit'] ?? null,
                    'device_class' => $entityData['device_class'] ?? null,
                ],
            );

            ProcessEntityState::dispatch($entity->id, (string) $entityData['value'], $entityData['attributes'] ?? []);
        }

        return response()->json(['status' => 'ok', 'device' => $device->id, 'entities_processed' => count($entities[0])]);
    }

    public function deviceState(Request $request, Device $device): JsonResponse
    {
        $validated = $request->validate([
            'status' => 'nullable|string',
            'entities' => 'required|array',
            'entities.*.entity_id' => 'required|string',
            'entities.*.value' => 'required|string',
            'entities.*.unit' => 'nullable|string',
            'entities.*.device_class' => 'nullable|string',
            'entities.*.entity_type' => 'nullable|string',
        ]);

        $device->update([
            'status' => $validated['status'] ?? 'online',
            'last_seen' => now(),
        ]);

        foreach ($validated['entities'] as $entityData) {
            $entity = Entity::firstOrCreate(
                ['device_id' => $device->id, 'entity_id' => $entityData['entity_id']],
                [
                    'name' => $entityData['entity_id'],
                    'entity_type' => $entityData['entity_type'] ?? 'sensor',
                    'unit' => $entityData['unit'] ?? null,
                    'device_class' => $entityData['device_class'] ?? null,
                ],
            );

            ProcessEntityState::dispatch($entity->id, $entityData['value'], $entityData['attributes'] ?? []);
        }

        return response()->json(['status' => 'ok']);
    }

    public function mqttIngest(Request $request): JsonResponse
    {
        $topic = $request->input('topic', '');
        $payload = $request->input('payload', []);

        preg_match('/^esphome\/([^\/]+)\/([^\/]+)\/state$/', $topic, $matches);

        if (empty($matches)) {
            return response()->json(['status' => 'error', 'message' => 'Invalid topic format'], 422);
        }

        $nodeName = $matches[1];
        $entityId = $matches[2];

        $device = Device::firstOrCreate(
            ['esphome_node' => $nodeName],
            ['name' => $nodeName, 'status' => 'online'],
        );

        $device->update(['status' => 'online', 'last_seen' => now()]);

        $entity = Entity::firstOrCreate(
            ['device_id' => $device->id, 'entity_id' => $entityId],
            [
                'name' => $entityId,
                'entity_type' => $payload['entity_type'] ?? 'sensor',
                'unit' => $payload['unit_of_measurement'] ?? null,
                'device_class' => $payload['device_class'] ?? null,
            ],
        );

        $value = $payload['state'] ?? $payload['value'] ?? json_encode($payload);

        ProcessEntityState::dispatch($entity->id, $value, $payload);

        return response()->json(['status' => 'ok']);
    }
}
