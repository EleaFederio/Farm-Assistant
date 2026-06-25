<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class HydroponicSystem extends Model
{
    protected $fillable = [
        'zone_id',
        'name',
        'system_type',
        'reservoir_volume',
        'water_capacity',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'reservoir_volume' => 'decimal:2',
            'water_capacity' => 'decimal:2',
        ];
    }

    /** @return BelongsTo<Zone, $this> */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /** @return HasMany<NutrientSolution, $this> */
    public function nutrientSolutions(): HasMany
    {
        return $this->hasMany(NutrientSolution::class);
    }
}
