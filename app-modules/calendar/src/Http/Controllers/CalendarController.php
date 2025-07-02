<?php

declare(strict_types=1);

namespace Modules\Calendar\Http\Controllers;

use Illuminate\Http\Request;
use Modules\Team\DTOs\TeamData;

final class CalendarController
{
    public function index(Request $request)
    {
        return inertia()->render('calendar::index');
    }
}
