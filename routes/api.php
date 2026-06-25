<?php

use App\Http\Controllers\Api\EspWebhookController;
use Illuminate\Support\Facades\Route;

Route::post('/esphome/webhook', [EspWebhookController::class, 'ingest'])
    ->name('api.esphome.webhook');

Route::post('/esphome/device/{device}/state', [EspWebhookController::class, 'deviceState'])
    ->name('api.esphome.device-state');

Route::post('/mqtt/webhook', [EspWebhookController::class, 'mqttIngest'])
    ->name('api.mqtt.webhook');
