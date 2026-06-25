<?php

namespace App\Http\Controllers;

use App\Models\Farm;
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
        $farm->load(['zones', 'zones.devices', 'zones.cropCycles.crop']);

        return Inertia::render('farms/show', [
            'farm' => $farm,
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
}
