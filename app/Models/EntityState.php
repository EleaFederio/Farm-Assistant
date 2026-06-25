<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EntityState extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'entity_id',
        'value',
        'attributes',
        'recorded_at',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'json',
            'recorded_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Entity, $this> */
    public function entity(): BelongsTo
    {
        return $this->belongsTo(Entity::class);
    }
}
