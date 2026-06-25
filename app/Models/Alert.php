<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Alert extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'alert_rule_id',
        'entity_state_id',
        'message',
        'status',
        'triggered_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'triggered_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<AlertRule, $this> */
    public function alertRule(): BelongsTo
    {
        return $this->belongsTo(AlertRule::class);
    }

    /** @return BelongsTo<EntityState, $this> */
    public function entityState(): BelongsTo
    {
        return $this->belongsTo(EntityState::class);
    }
}
