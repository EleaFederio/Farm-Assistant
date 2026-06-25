<?php

namespace App\Http\Controllers;

use App\Models\CalendarEvent;
use App\Models\CropCycle;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class CalendarController extends Controller
{
    public function index(Request $request): Response
    {
        $month = $request->get('month', now()->month);
        $year = $request->get('year', now()->year);

        $events = CalendarEvent::with(['farm', 'cropCycle.crop'])
            ->whereMonth('event_date', $month)
            ->whereYear('event_date', $year)
            ->orderBy('event_date')
            ->get();

        $cropCycles = CropCycle::with(['crop', 'zone'])
            ->where('status', 'active')
            ->get()
            ->map(fn ($cycle) => [
                'title' => $cycle->name,
                'start' => $cycle->start_date ? Carbon::parse($cycle->start_date)->format('Y-m-d') : null,
                'end' => $cycle->expected_harvest_date ? Carbon::parse($cycle->expected_harvest_date)->format('Y-m-d') : null,
                'status' => $cycle->status,
                'type' => 'cycle',
            ]);

        return Inertia::render('calendar/index', [
            'events' => $events,
            'cropCycles' => $cropCycles,
            'currentMonth' => $month,
            'currentYear' => $year,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'farm_id' => 'required|exists:farms,id',
            'crop_cycle_id' => 'nullable|exists:crop_cycles,id',
            'event_type' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'event_date' => 'required|date',
        ]);

        CalendarEvent::create($validated);

        return redirect()->route('calendar.index');
    }

    public function destroy(CalendarEvent $calendarEvent): RedirectResponse
    {
        $calendarEvent->delete();

        return redirect()->route('calendar.index');
    }
}
