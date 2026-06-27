<?php

use App\Http\Controllers\AlertController;
use App\Http\Controllers\CalendarController;
use App\Http\Controllers\CropController;
use App\Http\Controllers\CropCycleController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DeviceController;
use App\Http\Controllers\EntityCommandController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\HydroponicController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\SensorDataController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');
    Route::get('farms', [FarmController::class, 'index'])->name('farms.index');
    Route::post('farms', [FarmController::class, 'store'])->name('farms.store');
    Route::get('farms/{farm}', [FarmController::class, 'show'])->name('farms.show');
    Route::put('farms/{farm}', [FarmController::class, 'update'])->name('farms.update');
    Route::delete('farms/{farm}', [FarmController::class, 'destroy'])->name('farms.destroy');
    Route::post('farms/{farm}/zones', [FarmController::class, 'storeZone'])->name('farms.zones.store');
    Route::put('farms/{farm}/zones/{zone}', [FarmController::class, 'updateZone'])->name('farms.zones.update');
    Route::delete('farms/{farm}/zones/{zone}', [FarmController::class, 'destroyZone'])->name('farms.zones.destroy');

    Route::get('crops', [CropController::class, 'index'])->name('crops.index');
    Route::post('crops', [CropController::class, 'store'])->name('crops.store');
    Route::put('crops/{crop}', [CropController::class, 'update'])->name('crops.update');
    Route::delete('crops/{crop}', [CropController::class, 'destroy'])->name('crops.destroy');

    Route::get('crop-cycles', [CropCycleController::class, 'index'])->name('crop-cycles.index');
    Route::get('crop-cycles/create', [CropCycleController::class, 'create'])->name('crop-cycles.create');
    Route::post('crop-cycles', [CropCycleController::class, 'store'])->name('crop-cycles.store');
    Route::get('crop-cycles/{cropCycle}', [CropCycleController::class, 'show'])->name('crop-cycles.show');
    Route::put('crop-cycles/{cropCycle}', [CropCycleController::class, 'update'])->name('crop-cycles.update');
    Route::delete('crop-cycles/{cropCycle}', [CropCycleController::class, 'destroy'])->name('crop-cycles.destroy');

    Route::get('devices', [DeviceController::class, 'index'])->name('devices.index');
    Route::post('devices', [DeviceController::class, 'store'])->name('devices.store');
    Route::get('devices/discover', [DeviceController::class, 'discover'])->name('devices.discover');
    Route::get('devices/scan', [DeviceController::class, 'scan'])->name('devices.scan');
    Route::post('devices/probe', [DeviceController::class, 'probe'])->name('devices.probe');
    Route::post('devices/register', [DeviceController::class, 'register'])->name('devices.register');
    Route::get('devices/{device}', [DeviceController::class, 'show'])->name('devices.show');
    Route::put('devices/{device}', [DeviceController::class, 'update'])->name('devices.update');
    Route::post('devices/{device}/disconnect', [DeviceController::class, 'disconnect'])->name('devices.disconnect');
    Route::delete('devices/{device}', [DeviceController::class, 'destroy'])->name('devices.destroy');

    Route::get('sensor-data', [SensorDataController::class, 'index'])->name('sensor-data.index');
    Route::get('sensor-data/{entity}', [SensorDataController::class, 'show'])->name('sensor-data.show');
    Route::get('sensor-data/{entity}/history', [SensorDataController::class, 'history'])->name('sensor-data.history');

    Route::post('api/entities/{entity}/command', [EntityCommandController::class, 'command'])->name('entities.command');

    Route::get('tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::put('tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::delete('tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');

    Route::get('calendar', [CalendarController::class, 'index'])->name('calendar.index');
    Route::post('calendar', [CalendarController::class, 'store'])->name('calendar.store');
    Route::delete('calendar/{calendarEvent}', [CalendarController::class, 'destroy'])->name('calendar.destroy');

    Route::get('alerts', [AlertController::class, 'index'])->name('alerts.index');
    Route::post('alerts/{alert}/resolve', [AlertController::class, 'resolve'])->name('alerts.resolve');
    Route::get('alert-rules', [AlertController::class, 'rules'])->name('alerts.rules');
    Route::post('alert-rules', [AlertController::class, 'storeRule'])->name('alerts.rules.store');
    Route::put('alert-rules/{alertRule}', [AlertController::class, 'updateRule'])->name('alerts.rules.update');

    Route::get('hydroponics', [HydroponicController::class, 'index'])->name('hydroponics.index');
    Route::post('hydroponics', [HydroponicController::class, 'store'])->name('hydroponics.store');
    Route::get('hydroponics/{hydroponicSystem}', [HydroponicController::class, 'show'])->name('hydroponics.show');
    Route::post('hydroponics/{hydroponicSystem}/nutrient', [HydroponicController::class, 'storeNutrient'])->name('hydroponics.nutrient.store');

    Route::get('notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::post('notifications/{notification}/read', [NotificationController::class, 'markRead'])->name('notifications.read');
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead'])->name('notifications.read-all');
});

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', DashboardController::class)->name('dashboardTeam');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])->name('invitations.accept');
    Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'decline'])->name('invitations.decline');
});

require __DIR__.'/settings.php';
