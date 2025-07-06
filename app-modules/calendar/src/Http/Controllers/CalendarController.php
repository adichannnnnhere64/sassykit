<?php

declare(strict_types=1);

namespace Modules\Calendar\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Calendar\DTOs\CalendarCategoryData;
use Modules\Calendar\DTOs\CalendarEventData;
use Modules\Calendar\Models\CalendarEvent;

final class CalendarController
{
    public function index()
    {
        /* dd(auth()->user()->setSetting('theme', 'dark')); */

        /* $theme = auth()->user()->getSetting('theme', 'light'); */
        // Define color mappings (could also come from database)

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

        $calendarEvents = CalendarEvent::with('categories')->where('user_id', auth()->user()->id)->get();

        /* dd($calendarEvents->first()->categories); */
        /* dd(CalendarEventData::from($calendarEvents->first())); */
        $events = CalendarEventData::collect($calendarEvents);

        return inertia()->render('calendar::index', [
            'defaultEvents' => $events,
            'defaultCategories' => CalendarCategoryData::collect(auth()->user()->calendarCategories()->get()),
            'defaultColor' => '#3174ad',
        ]);
    }

    public function createModal(Request $request)
    {

        $data = $request->validate([
            'start' => 'required|date',
            'end' => 'required|date',
            'id' => 'nullable',
            'create' => 'nullable',
        ]);
        /* dd($data); */

        $id = @$data['id'];
        $create = @$data['create'];
        $start_time = Carbon::parse($data['start'])->format('H:i:s');
        $end_time = Carbon::parse($data['end'])->format('H:i:s');

        $start_date = Carbon::parse($data['start'])->format('Y-m-d');
        $end_date = Carbon::parse($data['end'])->format('Y-m-d');

        if ($create) {
            $start_time = now()->format('H:i:s');
            $end_time = now()->addHour()->format('H:i:s');

            $start_date = now()->format('Y-m-d');
            $end_date = now()->format('Y-m-d');
        }

        $categories = auth()->user()->calendarCategories()->get()->map(function ($data) {
            return [
                'value' => $data->id,
                'label' => $data->name,
                'color' => $data->color,
            ];
        });

        $title = '';
        $description = '';
        $color = null;
        $userCategories = [];
        $amount = '';

        $event = CalendarEvent::with('categories')->find($id);

        if ($event) {
            $title = $event->title;
            $description = $event->description;
            $color = $event->color;
            $userCategories = $event->categories?->pluck('id') ?? [];
            $amount = $event->amount;
        }

        return inertia()->render('calendar::modals/create-event', compact('id', 'start_time', 'end_time', 'start_date', 'end_date', 'categories', 'title', 'description', 'userCategories', 'color', 'amount'));
    }

    /* public function update(Request $request) */
    /* { */
    /*     $data = $request->validate([ */
    /*         'title' => 'required', */
    /*         'description' => 'required', */
    /*         'start' => 'required', */
    /*         'end' => 'required', */
    /*         'start_date' => 'required|date', */
    /*         'end_date' => 'required|date', */
    /*         'categories' => 'required|array', */
    /*     ]); */

    /*     /1* dd($data) *1/ */

    /* } */

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required',
            'description' => 'nullable',
            'start' => 'required',
            'end' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'categories' => 'array|nullable',
            'color' => 'required',
            'amount' => 'nullable'
        ]);

        $start = $data['start_date'].' '.$data['start'];
        $end = $data['end_date'].' '.$data['end'];

        /* dd($data, $start, $end); */

        $event = auth()->user()->calendarEvents()->create([
            'title' => $data['title'],
            'amount' => $data['amount'],
            'description' => $data['description'],
            'start' => $start,
            'end' => $end,
            'color' => $data['color'],

            /* 'category_id' => auth()->user()->calendarCategories()->first()->id */
        ]);

        $event->categories()->sync($data['categories']);

        $event->load('categories');

        return redirect()->back()->with([
            'message' => 'Event created successfully',
            'event' => CalendarEventData::from($event),
        ]);

    }

    public function update(Request $request, CalendarEvent $model)
    {
        $data = $request->validate([
            'title' => 'nullable',
            'description' => 'nullable',
            'start' => 'required',
            'end' => 'required',
            'start_date' => 'required|date',
            'end_date' => 'required|date',
            'color' => 'required',
            'amount' => 'nullable',
            'categories' => 'nullable|array', // assuming categories is an array of IDs
        ]);

        $start = $data['start_date'].' '.$data['start'];
        $end = $data['end_date'].' '.$data['end'];
        $model->update([
            'title' => @$data['title'] ?? null, // Fallback to null if key doesn't exist
            'description' => @$data['description'] ?? null,
            'color' => $data['color'] ?? null,
            'start' => $start,
            'end' => $end,
            'amount' => $data['amount'],
        ]);

        if (isset($data['categories'])) {
            $model->categories()->sync($data['categories']);
        }

        return redirect()->back()->with([
            'message' => 'Event updated successfully',
        ]);
    }

    public function updateTime(Request $request, CalendarEvent $model)
    {
        $data = $request->validate([
            'start' => 'required',
            'end' => 'required',
        ]);

        $model->update([
            'start' => $data['start'],
            'end' => $data['end'],
        ]);

        return redirect()->back()->with([
            'message' => 'Event updated successfully',
        ]);
    }

    public function destroy(CalendarEvent $model)
    {
        $model->delete();

        return redirect()->back()->with([
            'message' => 'Event deleted successfully',
        ]);
    }
}
