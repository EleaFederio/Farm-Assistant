<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TaskController extends Controller
{
    public function index(Request $request): Response
    {
        $query = Task::with(['farm', 'cropCycle.crop'])
            ->whereHas('farm', function ($q) {
                $q->where('user_id', auth()->id());
            });

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        $tasks = $query->latest()->get();

        return Inertia::render('tasks/index', [
            'tasks' => $tasks,
            'filters' => $request->only(['status', 'priority']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'farm_id' => 'required|exists:farms,id',
            'crop_cycle_id' => 'nullable|exists:crop_cycles,id',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'due_date' => 'nullable|date',
        ]);

        Task::create($validated);

        return redirect()->route('tasks.index');
    }

    public function update(Request $request, Task $task): RedirectResponse
    {
        $validated = $request->validate([
            'status' => 'required|string|in:pending,in_progress,completed,cancelled',
            'priority' => 'required|string|in:low,medium,high,urgent',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        if ($validated['status'] === 'completed' && ! $task->completed_at) {
            $validated['completed_at'] = now();
        }

        $task->update($validated);

        return redirect()->route('tasks.index');
    }

    public function destroy(Task $task): RedirectResponse
    {
        $task->delete();

        return redirect()->route('tasks.index');
    }
}
