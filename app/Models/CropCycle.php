<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CropCycle extends Model
{
    protected $fillable = [
        'crop_id',
        'zone_id',
        'name',
        'quantity',
        'start_date',
        'expected_harvest_date',
        'actual_harvest_date',
        'status',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'integer',
            'start_date' => 'date',
            'expected_harvest_date' => 'date',
            'actual_harvest_date' => 'date',
        ];
    }

    /** @return BelongsTo<Crop, $this> */
    public function crop(): BelongsTo
    {
        return $this->belongsTo(Crop::class);
    }

    /** @return BelongsTo<Zone, $this> */
    public function zone(): BelongsTo
    {
        return $this->belongsTo(Zone::class);
    }

    /** @return HasMany<Task, $this> */
    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class);
    }

    /** @return HasMany<CalendarEvent, $this> */
    public function calendarEvents(): HasMany
    {
        return $this->hasMany(CalendarEvent::class);
    }

    /** @return HasMany<AiObservation, $this> */
    public function aiObservations(): HasMany
    {
        return $this->hasMany(AiObservation::class);
    }
}
