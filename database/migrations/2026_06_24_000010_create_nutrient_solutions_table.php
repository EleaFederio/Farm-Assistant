<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('nutrient_solutions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('hydroponic_system_id')->constrained()->cascadeOnDelete();
            $table->decimal('ph_target', 4, 2)->nullable();
            $table->decimal('ec_target', 6, 2)->nullable();
            $table->decimal('water_volume', 10, 2)->nullable();
            $table->timestamp('last_mixed_at')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('nutrient_solutions');
    }
};
