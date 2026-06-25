<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entity_states', function (Blueprint $table) {
            $table->id();
            $table->foreignId('entity_id')->constrained()->cascadeOnDelete();
            $table->string('value');
            $table->json('attributes')->nullable();
            $table->timestamp('recorded_at')->useCurrent();

            $table->index(['entity_id', 'recorded_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entity_states');
    }
};
