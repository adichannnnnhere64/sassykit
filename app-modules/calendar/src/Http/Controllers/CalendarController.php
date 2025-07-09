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
    public function index(Request $request)
    {
        $view = $request->input('view', 'month');
        $date = $request->input('date') ? Carbon::parse($request->input('date')) : now();

        // Calculate date range based on view
        switch ($view) {
            case 'week':
                $start = $date->startOfWeek();
                $end = $date->endOfWeek();
                break;
            case 'day':
                $start = $date->startOfDay();
                $end = $date->endOfDay();
                break;
            default: // month
                $start = $date->startOfMonth();
                $end = $date->endOfMonth();
        }

        $events = CalendarEvent::with('categories')
            ->where('user_id', auth()->id())
            ->whereBetween('start', [$start, $end])
            ->get();

        return inertia()->render('calendar::index', [
            'defaultCategories' => CalendarCategoryData::collect(auth()->user()->calendarCategories()->get()),
            'defaultEvents' => $events,
            'total' => $events->sum('amount'),
            'currentView' => $view,
            'currentDate' => $date->toISOString(),
        ]);
    }

    public function getEvents(Request $request)
    {
          $request->validate([
        'start' => 'required|date',
        'end' => 'required|date',
        'view' => 'nullable|string|in:month,week,day,agenda',
        'categories' => 'nullable|array',
        'categories.*' => 'nullable|integer|exists:calendar_categories,id',
    ]);

    $calendarEvents = $this->getEventsInRange(
        $request->start,
        $request->end,
        $request->input('categories', [])
        );

        $events = CalendarEventData::collect($calendarEvents);

        // Calculate total differently for agenda view
        $total = $events->sum('amount');

        if ($request->view === 'agenda') {
            // For agenda view, calculate total only for current month
            $currentMonthStart = now()->startOfMonth();
            $currentMonthEnd = now()->endOfMonth();

            $monthEvents = $calendarEvents->filter(function ($event) use ($currentMonthStart, $currentMonthEnd) {
                return $event->start->between($currentMonthStart, $currentMonthEnd) ||
                       $event->end->between($currentMonthStart, $currentMonthEnd) ||
                       ($event->start <= $currentMonthStart && $event->end >= $currentMonthEnd);
            });

            $total = $monthEvents->sum('amount');
        }

        return response()->json([
            'total' => $total,
            'events' => $events,
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

    $id = @$data['id'];
    $create = @$data['create'];


    $start_time = Carbon::parse($data['start'])->format('H:i:s');
    $end_time = Carbon::parse($data['start'])->format('H:i:s');

    $date = Carbon::parse($data['end'])->format('Y-m-d');

    if ($create) {
        $start_time = now()->format('H:i:s');
        $end_time = now()->addHour()->format('H:i:s');
        $date = now()->format('Y-m-d');
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

    return inertia()->render('calendar::modals/create-event', [
        'id' => $id,
        'start_time' => $start_time,
        'end_time' => $end_time,
        'start_date' => $date,
        'categories' => $categories,
        'title' => $title,
        'description' => $description,
        'userCategories' => $userCategories,
        'color' => $color,
        'amount' => $amount
    ]);
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
            'start_date' => 'required',
            /* 'end' => 'required', */
            /* 'start_date' => 'required|date', */
            /* 'end_date' => 'required|date', */
            'categories' => 'array|nullable',
            'color' => 'required',
            'amount' => 'nullable',
        ]);

        $start = $data['start_date'] . ' 12:00:00';
        $end = $data['start_date'] . ' 12:59:59';

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
            /* 'start' => 'required', */
            /* 'end' => 'required', */
            'start_date' => 'required|date',
            /* 'end_date' => 'required|date', */
            'color' => 'required',
            'amount' => 'nullable',
            'categories' => 'nullable|array', // assuming categories is an array of IDs
        ]);

        $start = $data['start_date'] . ' 12:00:00';
        $end = $data['start_date'] . ' 12:59:59';

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
            'end' => $data['start'],
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

    private function getEventsInRange($start, $end, $categoryIds = [])
{
    $start = Carbon::parse($start);
    $end = Carbon::parse($end);

    $query = CalendarEvent::with('categories')
        ->where('user_id', auth()->id())
        ->where(function ($query) use ($start, $end) {
            $query->whereBetween('start', [$start, $end])
                ->orWhereBetween('end', [$start, $end])
                ->orWhere(function ($q) use ($start, $end) {
                    $q->where('start', '<', $start)
                        ->where('end', '>', $end);
                });
        });

    // Add category filter if category IDs are provided
    if (!empty($categoryIds)) {
        $query->whereHas('categories', function ($q) use ($categoryIds) {
            $q->whereIn('calendar_categories.id', $categoryIds);
        });
    }

    return $query->orderBy('start')->get();
}

}
