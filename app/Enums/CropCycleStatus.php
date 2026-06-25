<?php

namespace App\Enums;

enum CropCycleStatus: string
{
    case Planned = 'planned';
    case Active = 'active';
    case Growing = 'growing';
    case Harvesting = 'harvesting';
    case Completed = 'completed';
    case Failed = 'failed';
}
