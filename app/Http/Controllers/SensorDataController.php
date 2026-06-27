<?php

namespace App\Http\Controllers;

use App\Models\Entity;
use App\Models\EntityState;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SensorDataController extends Controller
{
    public function index(): Response
    {
        $entities = Entity::with(['device.zone.farm', 'latestState'])
            ->where('enabled', true)
            ->get();

        return Inertia::render('sensor-data/index', [
            'entities' => $entities,
        ]);
    }

    public function show(Entity $entity): Response
    {
        $entity->load(['device.zone.farm']);

        $states = EntityState::where('entity_id', $entity->id)
            ->orderBy('recorded_at', 'desc')
            ->limit(200)
            ->get()
            ->reverse()
            ->values();

        return Inertia::render('sensor-data/show', [
            'entity' => $entity,
            'states' => $states,
        ]);
    }

    public function history(Request $request, Entity $entity): JsonResponse
    {
        $range = $request->get('range', '24h');

        $from = match ($range) {
            '1h' => now()->subHour(),
            '6h' => now()->subHours(6),
            '24h' => now()->subDay(),
            '7d' => now()->subWeek(),
            '30d' => now()->subMonth(),
            default => now()->subDay(),
        };

        $states = EntityState::where('entity_id', $entity->id)
            ->where('recorded_at', '>=', $from)
            ->orderBy('recorded_at', 'asc')
            ->get();

        return response()->json($states);
    }
}
