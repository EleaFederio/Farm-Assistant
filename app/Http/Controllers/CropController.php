<?php

namespace App\Http\Controllers;

use App\Models\Crop;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CropController extends Controller
{
    public function index(): Response
    {
        $crops = Crop::withCount('cropCycles')
            ->orderBy('name')
            ->get();

        return Inertia::render('crops/index', [
            'crops' => $crops,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'days_to_harvest' => 'nullable|integer|min:0',
            'optimal_ph_min' => 'nullable|numeric|min:0|max:14',
            'optimal_ph_max' => 'nullable|numeric|min:0|max:14',
            'optimal_tds_min' => 'nullable|integer|min:0',
            'optimal_tds_max' => 'nullable|integer|min:0',
            'optimal_temp_min' => 'nullable|numeric',
            'optimal_temp_max' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        Crop::create($validated);

        return redirect()->route('crops.index');
    }

    public function update(Request $request, Crop $crop): RedirectResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'scientific_name' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:255',
            'days_to_harvest' => 'nullable|integer|min:0',
            'optimal_ph_min' => 'nullable|numeric|min:0|max:14',
            'optimal_ph_max' => 'nullable|numeric|min:0|max:14',
            'optimal_tds_min' => 'nullable|integer|min:0',
            'optimal_tds_max' => 'nullable|integer|min:0',
            'optimal_temp_min' => 'nullable|numeric',
            'optimal_temp_max' => 'nullable|numeric',
            'description' => 'nullable|string',
        ]);

        $crop->update($validated);

        return redirect()->route('crops.index');
    }

    public function destroy(Crop $crop): RedirectResponse
    {
        $crop->delete();

        return redirect()->route('crops.index');
    }
}
