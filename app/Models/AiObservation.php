<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiObservation extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'farm_id',
        'crop_cycle_id',
        'summary',
        'recommendation',
        'confidence',
        'generated_at',
    ];

    protected function casts(): array
    {
        return [
            'confidence' => 'decimal:2',
            'generated_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Farm, $this> */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /** @return BelongsTo<CropCycle, $this> */
    public function cropCycle(): BelongsTo
    {
        return $this->belongsTo(CropCycle::class);
    }
}
