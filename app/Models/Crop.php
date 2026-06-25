<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Crop extends Model
{
    protected $fillable = [
        'name',
        'scientific_name',
        'category',
        'days_to_harvest',
        'optimal_ph_min',
        'optimal_ph_max',
        'optimal_tds_min',
        'optimal_tds_max',
        'optimal_temp_min',
        'optimal_temp_max',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'days_to_harvest' => 'integer',
            'optimal_ph_min' => 'decimal:2',
            'optimal_ph_max' => 'decimal:2',
            'optimal_tds_min' => 'integer',
            'optimal_tds_max' => 'integer',
            'optimal_temp_min' => 'decimal:2',
            'optimal_temp_max' => 'decimal:2',
        ];
    }

    /** @return HasMany<CropCycle, $this> */
    public function cropCycles(): HasMany
    {
        return $this->hasMany(CropCycle::class);
    }
}
