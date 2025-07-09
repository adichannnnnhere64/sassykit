<?php

declare(strict_types=1);

namespace Modules\Calendar\Http\Controllers;

use Carbon\Carbon;
use DateTime;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Modules\Calendar\DTOs\CalendarCategoryData;
use Modules\Calendar\DTOs\CalendarEventData;
use Modules\Calendar\Models\CalendarCategory;

final class CalendarCategoryController
{

    public function create()
    {
        return inertia()->render('calendar::modals/create-category');
    }

    public function store(Request $request){

        $data = $request->validate([
            'name' => 'required|unique:calendar_categories,name',
            'color' => 'required',
        ]);

        $calendarCategory = auth()->user()->calendarCategories()->create($data);

        return redirect()->route('calendar')->with('success', 'Category created successfully');
    }

    public function destroy(Request $request, CalendarCategory $model)
    {
        $model->delete();

        return redirect()->back()->with([
            'message' => 'Category deleted successfully',
        ]);

    }

    public function update(Request $request, CalendarCategory $model)
    {
        $model->name = $request->name;
        $model->save();

        return redirect()->back()->with([
            'message' => 'Category updated successfully',
        ]);


    }

}
