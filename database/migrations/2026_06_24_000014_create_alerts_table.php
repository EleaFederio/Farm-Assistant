<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('alerts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('alert_rule_id')->constrained()->cascadeOnDelete();
            $table->foreignId('entity_state_id')->nullable()->constrained()->nullOnDelete();
            $table->text('message');
            $table->string('status')->default('triggered');
            $table->timestamp('triggered_at')->useCurrent();
            $table->timestamp('resolved_at')->nullable();
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('alerts');
    }
};
