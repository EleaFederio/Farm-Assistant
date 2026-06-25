<?php

namespace App\Enums;

enum EntityType: string
{
    case Sensor = 'sensor';
    case BinarySensor = 'binary_sensor';
    case Switch_ = 'switch';
    case Number = 'number';
    case Button = 'button';
    case Select = 'select';
    case Light = 'light';
    case Fan = 'fan';
    case Valve = 'valve';
    case Pump = 'pump';
    case Automation = 'automation';
}
