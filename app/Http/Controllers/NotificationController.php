<?php

namespace App\Http\Controllers;

use App\Models\FarmNotification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function index(): Response
    {
        $notifications = FarmNotification::where('user_id', auth()->id())
            ->latest()
            ->paginate(20);

        return Inertia::render('notifications/index', [
            'notifications' => $notifications,
        ]);
    }

    public function markRead(FarmNotification $notification): RedirectResponse
    {
        if ($notification->user_id !== auth()->id()) {
            abort(403);
        }

        $notification->update(['status' => 'sent']);

        return redirect()->route('notifications.index');
    }

    public function markAllRead(): RedirectResponse
    {
        FarmNotification::where('user_id', auth()->id())
            ->where('status', 'pending')
            ->update(['status' => 'sent']);

        return redirect()->route('notifications.index');
    }
}
