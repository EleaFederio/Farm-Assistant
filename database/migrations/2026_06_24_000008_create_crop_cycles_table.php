<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('crop_cycles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('crop_id')->constrained()->cascadeOnDelete();
            $table->foreignId('zone_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->integer('quantity')->default(0);
            $table->date('start_date')->nullable();
            $table->date('expected_harvest_date')->nullable();
            $table->date('actual_harvest_date')->nullable();
            $table->string('status')->default('planned');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index('crop_id');
            $table->index('zone_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('crop_cycles');
    }
};
