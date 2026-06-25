<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use App\Models\CropCycle;
use App\Models\Zone;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CropCycleController extends Controller
{
    public function index(): Response
    {
        $cycles = CropCycle::with(['crop', 'zone.farm'])
            ->latest()
            ->get();

        return Inertia::render('crop-cycles/index', [
            'cycles' => $cycles,
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('crop-cycles/create', [
            'crops' => Crop::orderBy('name')->get(),
            'zones' => Zone::with('farm')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'crop_id' => 'required|exists:crops,id',
            'zone_id' => 'required|exists:zones,id',
            'name' => 'required|string|max:255',
            'quantity' => 'nullable|integer|min:0',
            'start_date' => 'nullable|date',
            'expected_harvest_date' => 'nullable|date|after:start_date',
            'status' => 'required|string|in:planned,active,growing,harvesting,completed,failed',
            'notes' => 'nullable|string',
        ]);

        CropCycle::create($validated);

        return redirect()->route('crop-cycles.index');
    }

    public function show(CropCycle $cropCycle): Response
    {
        $cropCycle->load(['crop', 'zone.farm', 'tasks', 'calendarEvents']);

        return Inertia::render('crop-cycles/show', [
            'cycle' => $cropCycle,
        ]);
    }

    public function update(Request $request, CropCycle $cropCycle): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:planned,active,growing,harvesting,completed,failed',
            'actual_harvest_date' => 'nullable|date',
            'notes' => 'nullable|string',
        ]);

        $cropCycle->update($validated);

        return redirect()->route('crop-cycles.show', $cropCycle);
    }

    public function destroy(CropCycle $cropCycle): RedirectResponse
    {
        $cropCycle->delete();

        return redirect()->route('crop-cycles.index');
    }
}
