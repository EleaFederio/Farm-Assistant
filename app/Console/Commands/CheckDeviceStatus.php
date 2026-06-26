<?php

namespace App\Console\Commands;

use App\Models\Device;
use Illuminate\Console\Command;

class CheckDeviceStatus extends Command
{
    protected $signature = 'devices:check';

    protected $description = 'Check device connectivity and mark offline devices';

    public function handle(): int
    {
        $staleMinutes = 3;
        $threshold = now()->subMinutes($staleMinutes);

        $devices = Device::where('status', '!=', 'disconnected')
            ->where('ip_address', '!=', null)
            ->get();

        $markedOffline = 0;

        foreach ($devices as $device) {
            $fp = @stream_socket_client(
                'tcp://'.$device->ip_address.':6053',
                $errno,
                $errstr,
                2,
            );

            if ($fp !== false) {
                fclose($fp);
                if ($device->status !== 'online') {
                    $device->update(['status' => 'online']);
                }
                continue;
            }

            $lastSeenAt = $device->last_seen !== null
                ? \Carbon\Carbon::parse($device->last_seen)
                : null;

            if ($lastSeenAt === null || $lastSeenAt->lt($threshold)) {
                $device->update(['status' => 'offline']);
                $markedOffline++;
            }
        }

        $this->info("Checked {$devices->count()} devices. Marked {$markedOffline} as offline.");

        return self::SUCCESS;
    }
}
