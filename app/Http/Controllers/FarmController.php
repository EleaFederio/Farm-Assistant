<?php

namespace App\Http\Controllers;

use App\Models\Device;
use App\Models\EntityState;
use App\Models\Farm;
use App\Models\Zone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FarmController extends Controller
{
    public function index(): Response
    {
        $farms = Farm::where('user_id', auth()->id())
            ->withCount('zones')
            ->latest()
            ->get();

        return Inertia::render('farms/index', [
            'farms' => $farms,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $farm = auth()->user()->farms()->create($validated);

        return redirect()->route('farms.show', $farm);
    }

    public function show(Farm $farm): Response
    {
        $farm->load([
            'zones.devices.entities.latestState',
            'zones.cropCycles.crop',
        ]);

        $devices = Device::with('zone')
            ->whereNull('zone_id')
            ->orWhereHas('zone', fn ($q) => $q->where('farm_id', $farm->id))
            ->get();

        return Inertia::render('farms/show', [
            'farm' => $farm,
            'devices' => $devices,
        ]);
    }

    public function update(Request $request, Farm $farm): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $farm->update($validated);

        return redirect()->route('farms.show', $farm);
    }

    public function destroy(Farm $farm): RedirectResponse
    {
        $farm->delete();

        return redirect()->route('farms.index');
    }

    public function storeZone(Request $request, Farm $farm): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
        ]);

        $farm->zones()->create($validated);

        return redirect()->route('farms.show', $farm);
    }

    public function updateZone(Request $request, Farm $farm, Zone $zone): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'nullable|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'description' => 'nullable|string',
        ]);

        $zone->update($validated);

        return redirect()->route('farms.show', $farm);
    }

    public function destroyZone(Farm $farm, Zone $zone): RedirectResponse
    {
        $zone->delete();

        return redirect()->route('farms.show', $farm);
    }

    public function assignDevice(Request $request, Farm $farm, Zone $zone): RedirectResponse
    {
        $validated = $request->validate([
            'device_id' => 'required|exists:devices,id',
        ]);

        Device::where('id', $validated['device_id'])->update([
            'zone_id' => $zone->id,
        ]);

        return redirect()->route('farms.show', $farm);
    }

    public function removeDevice(Farm $farm, Zone $zone, Device $device): RedirectResponse
    {
        $device->update(['zone_id' => null]);

        return redirect()->route('farms.show', $farm);
    }

    public function updateEntityPrefs(Request $request, Farm $farm, Zone $zone): JsonResponse
    {
        $validated = $request->validate([
            'hidden_entity_ids' => 'nullable|array',
            'hidden_entity_ids.*' => 'integer',
            'graph_entity_ids' => 'nullable|array',
            'graph_entity_ids.*' => 'integer',
        ]);

        $zone->update($validated);

        return response()->json(['ok' => true]);
    }

    public function entityHistory(Request $request, Farm $farm, Zone $zone): JsonResponse
    {
        $range = $request->get('range', '24h');
        $limit = (int) $request->get('limit', 200);

        $from = match ($range) {
            '1h' => now()->subHour(),
            '6h' => now()->subHours(6),
            '24h' => now()->subDay(),
            '7d' => now()->subWeek(),
            '30d' => now()->subMonth(),
            default => now()->subDay(),
        };

        $zone->load(['devices.entities']);

        $entityIds = [];
        foreach ($zone->devices as $device) {
            foreach ($device->entities as $entity) {
                $entityIds[] = $entity->id;
            }
        }

        if ($entityIds === []) {
            return response()->json([]);
        }

        $states = EntityState::whereIn('entity_id', $entityIds)
            ->where('recorded_at', '>=', $from)
            ->orderBy('recorded_at', 'asc')
            ->limit($limit)
            ->get()
            ->groupBy('entity_id')
            ->map(fn ($states) => $states->values()->all())
            ->all();

        return response()->json($states);
    }
}
