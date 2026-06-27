<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Zone extends Model
{
    protected $fillable = [
        'farm_id',
        'name',
        'type',
        'capacity',
        'description',
        'hidden_entity_ids',
        'graph_entity_ids',
    ];

    protected function casts(): array
    {
        return [
            'hidden_entity_ids' => 'array',
            'graph_entity_ids' => 'array',
        ];
    }

    /** @return BelongsTo<Farm, $this> */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /** @return HasMany<Device, $this> */
    public function devices(): HasMany
    {
        return $this->hasMany(Device::class);
    }

    /** @return HasMany<CropCycle, $this> */
    public function cropCycles(): HasMany
    {
        return $this->hasMany(CropCycle::class);
    }

    /** @return HasMany<HydroponicSystem, $this> */
    public function hydroponicSystems(): HasMany
    {
        return $this->hasMany(HydroponicSystem::class);
    }
}
