<?php

namespace App\Jobs;

use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\EntityState;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Foundation\Queue\Queueable;

class ProcessEntityState implements ShouldQueue
{
    use Dispatchable, Queueable;

    /** @param array<string, mixed> $attributes */
    public function __construct(
        public int $entityId,
        public string $value,
        public array $attributes = [],
    ) {}

    public function handle(): void
    {
        $state = EntityState::create([
            'entity_id' => $this->entityId,
            'value' => $this->value,
            'attributes' => ! empty($this->attributes) ? $this->attributes : null,
            'recorded_at' => now(),
        ]);

        $rules = AlertRule::where('entity_id', $this->entityId)
            ->where('enabled', true)
            ->get();

        foreach ($rules as $rule) {
            $numericValue = is_numeric($this->value) ? (float) $this->value : null;
            $threshold = is_numeric($rule->threshold_value) ? (float) $rule->threshold_value : null;

            if ($numericValue === null || $threshold === null) {
                continue;
            }

            $triggered = match ($rule->condition_operator) {
                '>' => $numericValue > $threshold,
                '<' => $numericValue < $threshold,
                '>=' => $numericValue >= $threshold,
                '<=' => $numericValue <= $threshold,
                '==' => $numericValue == $threshold,
                '!=' => $numericValue != $threshold,
                default => false,
            };

            if ($triggered) {
                $existingActive = Alert::where('alert_rule_id', $rule->id)
                    ->where('status', 'triggered')
                    ->exists();

                if (! $existingActive) {
                    Alert::create([
                        'alert_rule_id' => $rule->id,
                        'entity_state_id' => $state->id,
                        'message' => "{$rule->name}: {$this->value} {$rule->condition_operator} {$rule->threshold_value}",
                        'status' => 'triggered',
                        'triggered_at' => now(),
                    ]);
                }
            }
        }
    }
}
