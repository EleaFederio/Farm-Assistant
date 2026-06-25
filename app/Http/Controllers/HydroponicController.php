<?php

namespace App\Http\Controllers;

use App\Models\HydroponicSystem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HydroponicController extends Controller
{
    public function index(): Response
    {
        $systems = HydroponicSystem::with(['zone.farm', 'nutrientSolutions' => function ($q) {
            $q->latest()->limit(1);
        }])->latest()->get();

        return Inertia::render('hydroponics/index', [
            'systems' => $systems,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'zone_id' => 'required|exists:zones,id',
            'name' => 'required|string|max:255',
            'system_type' => 'required|string|max:255',
            'reservoir_volume' => 'nullable|numeric|min:0',
            'water_capacity' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        HydroponicSystem::create($validated);

        return redirect()->route('hydroponics.index');
    }

    public function show(HydroponicSystem $hydroponicSystem): Response
    {
        $hydroponicSystem->load(['zone.farm', 'nutrientSolutions' => function ($q) {
            $q->latest()->limit(10);
        }]);

        return Inertia::render('hydroponics/show', [
            'system' => $hydroponicSystem,
        ]);
    }

    public function storeNutrient(Request $request, HydroponicSystem $hydroponicSystem): RedirectResponse
    {
        $validated = $request->validate([
            'ph_target' => 'nullable|numeric|min:0|max:14',
            'ec_target' => 'nullable|numeric|min:0',
            'water_volume' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $hydroponicSystem->nutrientSolutions()->create([
            ...$validated,
            'last_mixed_at' => now(),
        ]);

        return redirect()->route('hydroponics.show', $hydroponicSystem);
    }
}
