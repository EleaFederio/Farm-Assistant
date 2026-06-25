<?php

namespace App\Enums;

enum ZoneType: string
{
    case Garden = 'garden';
    case Greenhouse = 'greenhouse';
    case Hydroponic = 'hydroponic';
    case Indoor = 'indoor';
    case Outdoor = 'outdoor';
    case Nursery = 'nursery';
    case Storage = 'storage';
}
