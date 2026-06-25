<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_observations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('farm_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('crop_cycle_id')->nullable()->constrained()->nullOnDelete();
            $table->text('summary');
            $table->text('recommendation')->nullable();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->timestamp('generated_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_observations');
    }
};
