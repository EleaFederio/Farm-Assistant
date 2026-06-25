<?php

namespace App\Enums;

enum DeviceStatus: string
{
    case Online = 'online';
    case Offline = 'offline';
    case Disconnected = 'disconnected';
    case Error = 'error';
    case Updating = 'updating';
}
