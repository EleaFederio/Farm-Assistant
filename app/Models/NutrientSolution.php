<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class NutrientSolution extends Model
{
    protected $fillable = [
        'hydroponic_system_id',
        'ph_target',
        'ec_target',
        'water_volume',
        'last_mixed_at',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'ph_target' => 'decimal:2',
            'ec_target' => 'decimal:2',
            'water_volume' => 'decimal:2',
            'last_mixed_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<HydroponicSystem, $this> */
    public function hydroponicSystem(): BelongsTo
    {
        return $this->belongsTo(HydroponicSystem::class);
    }
}
