<?php

declare(strict_types=1);

namespace Modules\Calendar\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Calendar\DTOs\CalendarCategoryData;
use Modules\Calendar\DTOs\CalendarEventData;

final class CalendarController
{
    public function index()
    {
        // Define color mappings (could also come from database)
        $eventColors = [
            'work' => 'pink',
            'personal' => '#ff6b6b',
            'meeting' => '#51cf66',
            'deadline' => '#ffa94d',
            'appointment' => '#9775fa',
            'travel' => '#20c997',
            'default' => '#868e96',
        ];


        /* auth()->user()->calendarCategories()->create([ */
            /* 'name' => 'tubol', */
            /* 'color' => 'pink', */
        /* ]); */



        /* auth()->user()->calendarEvents()->create([ */
        /*      'title' => 'Team Meeting', */
        /*      'start' => now()->addDay(), */
        /*      'end' => now()->addDay()->addHour(), */
        /*     'category_id' => auth()->user()->calendarCategories()->first()->id */
        /* ]); */


        /* dd( CalendarEventData::collect(auth()->user()->calendarEvents)); */

   $events = [
    [
        'id' => 1,
        'title' => 'Team Meeting',
        'start' => now()->setYear(2025)->setMonth(11)->setDay(1)->setTime(14, 0)->timezone('Asia/Manila')->format('Y-m-d\TH:i:sP'),
'end' => now()->setYear(2025)->setMonth(11)->setDay(1)->setTime(16, 30)->timezone('Asia/Manila')->format('Y-m-d\TH:i:sP'),

        'allDay' => false,
        'category' => 'work',
        'priority' => 'high',
        'status' => 'pending',
    ],
    [
        'id' => 2,
        'title' => 'Doctor Appointment',
        'start' => now()->setYear(2025)->setMonth(11)->setDay(1)->setTime(9, 0)->timezone('Asia/Manila')->format('Y-m-d\TH:i:sP'),
'end' => now()->setYear(2025)->setMonth(11)->setDay(1)->setTime(10, 30)->timezone('Asia/Manila')->format('Y-m-d\TH:i:sP'),
        'allDay' => false,
        'category' => 'appointment',
        'priority' => 'medium',
        'status' => 'pending',
    ],
];

        return inertia()->render('calendar::index', [
            'defaultEvents' => $events,
            'defaultCategories' => CalendarCategoryData::collect(auth()->user()->calendarCategories()->get()),
            'defaultColor' => '#3174ad',
        ]);
    }
}
