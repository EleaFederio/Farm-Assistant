<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Entity extends Model
{
    protected $fillable = [
        'device_id',
        'entity_id',
        'name',
        'entity_type',
        'unit',
        'device_class',
        'state_class',
        'icon',
        'attributes',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'json',
            'enabled' => 'boolean',
        ];
    }

    /** @return BelongsTo<Device, $this> */
    public function device(): BelongsTo
    {
        return $this->belongsTo(Device::class);
    }

    /** @return HasMany<EntityState, $this> */
    public function states(): HasMany
    {
        return $this->hasMany(EntityState::class);
    }

    /** @return HasOne<EntityState, $this> */
    public function latestState(): HasOne
    {
        return $this->hasOne(EntityState::class)->latestOfMany('recorded_at');
    }

    /** @return HasMany<AlertRule, $this> */
    public function alertRules(): HasMany
    {
        return $this->hasMany(AlertRule::class);
    }
}
