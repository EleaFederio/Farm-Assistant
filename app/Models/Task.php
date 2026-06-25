<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'farm_id',
        'crop_cycle_id',
        'title',
        'description',
        'priority',
        'status',
        'due_date',
        'completed_at',
    ];

    protected function casts(): array
    {
        return [
            'due_date' => 'datetime',
            'completed_at' => 'datetime',
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
