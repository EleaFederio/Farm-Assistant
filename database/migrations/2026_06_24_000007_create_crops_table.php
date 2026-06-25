<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crops', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('scientific_name')->nullable();
            $table->string('category')->nullable();
            $table->integer('days_to_harvest')->nullable();
            $table->decimal('optimal_ph_min', 4, 2)->nullable();
            $table->decimal('optimal_ph_max', 4, 2)->nullable();
            $table->integer('optimal_tds_min')->nullable();
            $table->integer('optimal_tds_max')->nullable();
            $table->decimal('optimal_temp_min', 5, 2)->nullable();
            $table->decimal('optimal_temp_max', 5, 2)->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crops');
    }
};
