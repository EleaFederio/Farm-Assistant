<?php

namespace App\Http\Controllers;

use App\Models\Alert;
use App\Models\CropCycle;
use App\Models\Farm;
use App\Models\FarmNotification;
use App\Models\Task;
use App\Models\TeamInvitation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $email = strtolower($user->email);

        $pendingInvitations = TeamInvitation::query()
            ->with(['inviter', 'team'])
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->where(fn ($query) => $query
                ->whereNull('expires_at')
                ->orWhere('expires_at', '>=', now()))
            ->latest()
            ->get()
            ->map(fn (TeamInvitation $invitation) => [
                'code' => $invitation->code,
                'inviterName' => $invitation->inviter->name,
                'team' => [
                    'name' => $invitation->team->name,
                    'slug' => $invitation->team->slug,
                ],
            ]);

        $farmsCount = Farm::where('user_id', $user->id)->count();
        $activeCycles = CropCycle::whereIn('zone_id', function ($q) use ($user) {
            $q->select('id')->from('zones')
                ->whereIn('farm_id', function ($q) use ($user) {
                    $q->select('id')->from('farms')->where('user_id', $user->id);
                });
        })->whereIn('status', ['active', 'growing'])->count();

        $pendingTasks = Task::whereHas('farm', function ($q) use ($user) {
            $q->where('user_id', $user->id);
        })->where('status', '!=', 'completed')->count();

        $activeAlerts = Alert::where('status', 'triggered')->count();
        $unreadNotifications = FarmNotification::where('user_id', $user->id)
            ->where('status', 'pending')
            ->count();

        $upcomingHarvests = CropCycle::with(['crop', 'zone'])
            ->whereIn('zone_id', function ($q) use ($user) {
                $q->select('id')->from('zones')
                    ->whereIn('farm_id', function ($q) use ($user) {
                        $q->select('id')->from('farms')->where('user_id', $user->id);
                    });
            })
            ->whereIn('status', ['active', 'growing'])
            ->whereNotNull('expected_harvest_date')
            ->orderBy('expected_harvest_date')
            ->limit(5)
            ->get();

        return Inertia::render('dashboard', [
            'pendingInvitations' => $pendingInvitations,
            'stats' => [
                'farms' => $farmsCount,
                'activeCycles' => $activeCycles,
                'pendingTasks' => $pendingTasks,
                'activeAlerts' => $activeAlerts,
                'unreadNotifications' => $unreadNotifications,
            ],
            'upcomingHarvests' => $upcomingHarvests,
        ]);
    }
}
