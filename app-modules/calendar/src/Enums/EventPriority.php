<?php

namespace Modules\Calendar\Enums;

enum EventPriority: string
{
    case LOW = 'low';
    case MEDIUM = 'medium';
    case HIGH = 'high';
}
