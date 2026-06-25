<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('devices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('zone_id')->nullable()->constrained()->nullOnDelete();
            $table->string('name');
            $table->string('device_type')->nullable();
            $table->string('manufacturer')->nullable();
            $table->string('esphome_node')->nullable()->unique();
            $table->string('mqtt_topic')->nullable();
            $table->string('ip_address')->nullable();
            $table->string('firmware_version')->nullable();
            $table->string('status')->default('offline');
            $table->timestamp('last_seen')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('devices');
    }
};
