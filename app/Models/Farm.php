<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Farm extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'location',
        'description',
    ];

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return HasMany<Zone, $this> */
    public function zones(): HasMany
    {
        return $this->hasMany(Zone::class);
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

    /** @return HasMany<AutomationRule, $this> */
    public function automationRules(): HasMany
    {
        return $this->hasMany(AutomationRule::class);
    }

    /** @return HasMany<AiObservation, $this> */
    public function aiObservations(): HasMany
    {
        return $this->hasMany(AiObservation::class);
    }
}
