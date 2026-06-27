<?php

namespace App\Console\Commands;

use App\Models\Device;
use Carbon\Carbon;
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
            ->get();

        $markedOffline = 0;

        foreach ($devices as $device) {
            $lastSeenAt = $device->last_seen !== null
                ? Carbon::parse($device->last_seen)
                : null;

            if ($device->ip_address !== null) {
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
            }

            if ($lastSeenAt === null || $lastSeenAt->lt($threshold)) {
                if ($device->status !== 'offline') {
                    $device->update(['status' => 'offline']);
                }
                $markedOffline++;
            }
        }

        $this->info("Checked {$devices->count()} devices. Marked {$markedOffline} as offline.");

        return self::SUCCESS;
    }
}
