<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->json('hidden_entity_ids')->nullable()->after('capacity');
            $table->json('graph_entity_ids')->nullable()->after('hidden_entity_ids');
        });
    }

    public function down(): void
    {
        Schema::table('zones', function (Blueprint $table) {
            $table->dropColumn(['hidden_entity_ids', 'graph_entity_ids']);
        });
    }
};
