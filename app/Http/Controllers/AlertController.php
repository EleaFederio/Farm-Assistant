<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\AlertRule;
use App\Models\Entity;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AlertController extends Controller
{
    public function index(): Response
    {
        $alerts = Alert::with(['alertRule.entity.device', 'entityState'])
            ->latest('triggered_at')
            ->limit(100)
            ->get();

        return Inertia::render('alerts/index', [
            'alerts' => $alerts,
        ]);
    }

    public function rules(): Response
    {
        $rules = AlertRule::with(['entity.device.zone.farm'])
            ->latest()
            ->get();

        return Inertia::render('alerts/rules', [
            'rules' => $rules,
            'entities' => Entity::with('device')->get(),
        ]);
    }

    public function storeRule(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'entity_id' => 'required|exists:entities,id',
            'name' => 'required|string|max:255',
            'condition_operator' => 'required|string|in:>,<,>=,<=,==,!=',
            'threshold_value' => 'required|string',
            'severity' => 'required|string|in:info,warning,critical,emergency',
            'notification_channel' => 'nullable|string|max:255',
        ]);

        AlertRule::create($validated);

        return redirect()->route('alerts.rules');
    }

    public function updateRule(Request $request, AlertRule $alertRule): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
        ]);

        $alertRule->update($validated);

        return redirect()->route('alerts.rules');
    }

    public function resolve(Alert $alert): RedirectResponse
    {
        $alert->update([
            'status' => 'resolved',
            'resolved_at' => now(),
        ]);

        return redirect()->route('alerts.index');
    }
}
