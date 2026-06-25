<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AutomationRule extends Model
{
    protected $fillable = [
        'farm_id',
        'trigger_entity_id',
        'name',
        'condition',
        'action',
        'enabled',
    ];

    protected function casts(): array
    {
        return [
            'condition' => 'json',
            'action' => 'json',
            'enabled' => 'boolean',
        ];
    }

    /** @return BelongsTo<Farm, $this> */
    public function farm(): BelongsTo
    {
        return $this->belongsTo(Farm::class);
    }

    /** @return BelongsTo<Entity, $this> */
    public function triggerEntity(): BelongsTo
    {
        return $this->belongsTo(Entity::class, 'trigger_entity_id');
    }
}
