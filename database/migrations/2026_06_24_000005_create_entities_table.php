<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('device_id')->constrained()->cascadeOnDelete();
            $table->string('entity_id');
            $table->string('name');
            $table->string('entity_type');
            $table->string('unit')->nullable();
            $table->string('device_class')->nullable();
            $table->string('state_class')->nullable();
            $table->string('icon')->nullable();
            $table->boolean('enabled')->default(true);
            $table->timestamps();

            $table->unique(['device_id', 'entity_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entities');
    }
};
