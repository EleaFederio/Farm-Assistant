<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Device extends Model
{
    protected $fillable = [
        'zone_id',
        'name',
        'friendly_name',
        'device_type',
        'manufacturer',
        'esphome_node',
        'mac_address',
        'mqtt_topic',
        'ip_address',
        'firmware_version',
        'status',
        'last_seen',
    ];

    protected function casts(): array
    {
        return [
            'last_seen' => 'datetime',
        ];
    }

    /** @return BelongsTo<Zone, $this> */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /** @return HasMany<Entity, $this> */
    public function entities(): HasMany
    {
        return $this->hasMany(Entity::class);
    }
}
