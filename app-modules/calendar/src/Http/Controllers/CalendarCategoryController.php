<?php

declare(strict_types=1);

namespace Modules\Calendar\Http\Controllers;

use Illuminate\Http\Request;
use Modules\Calendar\DTOs\CalendarCategoryData;
use Modules\Calendar\Models\CalendarCategory;

final class CalendarCategoryController
{
    public function index()
    {

        return inertia()->render('calendar::category', [
            'categories' => CalendarCategoryData::collect(auth()->user()->calendarCategories()->get()),
        ]);
    }

    public function create(Request $request)
    {
        $category = null;
        if ($request->has('id')) {

            $category = CalendarCategory::find($request->id);

        }

        return inertia()->render('calendar::modals/create-category', [
            'category' => CalendarCategoryData::optional($category),
        ]);
    }

    public function store(Request $request)
    {

        $data = $request->validate([
            'name' => 'required|unique:calendar_categories,name',
            'color' => 'required',
        ]);

        $calendarCategory = auth()->user()->calendarCategories()->create($data);

        return redirect()->back()->with('success', 'Category created successfully');
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

    public function updateModel(Request $request)
    {
        $request->validate([
            'name' => 'required|unique:calendar_categories,name,'.$request->id,
            'color' => 'required',
            'id' => 'required',
        ]);

        $model = CalendarCategory::find($request->id);

        if ($model) {
            $model->update($request->only('name', 'color'));

            return redirect()->back()->with([
                'message' => 'Category updated successfully',
            ]);
        }

        return redirect()->back()->with([
            'message' => 'Something went wrong',
        ]);

    }
}
