<?php

namespace App\Console\Commands;

use App\Jobs\ProcessEntityState;
use App\Models\Device;
use App\Models\Entity;
use App\Services\EspHomeService;
use Illuminate\Console\Command;

class EspHomePoll extends Command
{
    protected $signature = 'esphome:poll
        {--timeout=5 : HTTP request timeout in seconds}
        {--device= : Poll a specific device by ID}
        {--discover : Discover new entities from the device}
        {--no-save : Do not persist entity state data, just test connectivity}';

    protected $description = 'Poll ESPHome devices via their native HTTP API and record entity states';

    public function handle(EspHomeService $esphome): int
    {
        $query = Device::whereNotNull('ip_address');

        if ($deviceId = $this->option('device')) {
            $query->where('id', $deviceId);
        }

        $devices = $query->get();

        if ($devices->isEmpty()) {
            $this->warn('No devices with IP addresses found to poll.');

            return 0;
        }

        $successCount = 0;
        $entityCount = 0;

        foreach ($devices as $device) {
            $this->info("Polling {$device->name} ({$device->ip_address})...");

            $deviceInfo = $esphome->setTimeout((int) $this->option('timeout'))
                ->probeDevice($device->ip_address);

            if ($deviceInfo === null) {
                $device->update(['status' => 'error', 'last_seen' => now()]);
                $this->error("Failed to connect to {$device->name}");

                continue;
            }

            $device->update([
                'status' => 'online',
                'last_seen' => now(),
                'firmware_version' => $deviceInfo['firmware_version'] ?? $device->firmware_version,
                'friendly_name' => $deviceInfo['friendly_name'] ?? $device->friendly_name,
                'mac_address' => $deviceInfo['mac_address'] ?? $device->mac_address,
            ]);

            if ($this->option('discover') || $this->option('no-save')) {
                foreach ($deviceInfo['entities'] as $entityData) {
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

            if (! $this->option('no-save')) {
                foreach ($deviceInfo['entities'] as $entityData) {
                    if ($entityData['value'] === null) {
                        continue;
                    }

                    $entity = Entity::where('device_id', $device->id)
                        ->where('entity_id', $entityData['entity_id'])
                        ->first();

                    if ($entity) {
                        ProcessEntityState::dispatch($entity->id, $entityData['value'], []);
                        $entityCount++;
                    }
                }
            }

            $friendly = $deviceInfo['friendly_name'] ?? $deviceInfo['name'];
            $version = $deviceInfo['firmware_version'] ?? '?';
            $this->info("  → {$friendly} ({$deviceInfo['device_type']}, v{$version})");
            $this->info('  → '.count($deviceInfo['entities']).' entities');
            $successCount++;
        }

        $this->info("Done. Polled {$successCount} devices, recorded {$entityCount} entity states.");

        return 0;
    }
}
