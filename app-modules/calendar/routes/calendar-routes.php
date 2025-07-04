<?php

declare(strict_types=1);

// use Modules\Calendar\Http\Controllers\CalendarController;

// Route::get('/calendars', [CalendarController::class, 'index'])->name('calendars.index');
// Route::get('/calendars/create', [CalendarController::class, 'create'])->name('calendars.create');
// Route::post('/calendars', [CalendarController::class, 'store'])->name('calendars.store');
// Route::get('/calendars/{calendar}', [CalendarController::class, 'show'])->name('calendars.show');
// Route::get('/calendars/{calendar}/edit', [CalendarController::class, 'edit'])->name('calendars.edit');
// Route::put('/calendars/{calendar}', [CalendarController::class, 'update'])->name('calendars.update');
// Route::delete('/calendars/{calendar}', [CalendarController::class, 'destroy'])->name('calendars.destroy');
//

use Illuminate\Support\Facades\Route;
use Modules\Calendar\Http\Controllers\CalendarCategoryController;
use Modules\Calendar\Http\Controllers\CalendarController as ControllersCalendarController;
use Modules\Team\Http\Controllers\CalendarController;

Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/calendars', [ControllersCalendarController::class, 'index'])->name('calendar');
    Route::get('/calendars/modal', [ControllersCalendarController::class, 'createModal'])->name('calendar.create-modal');


    Route::get('/calendars/category/modal', [CalendarCategoryController::class, 'create'])->name('calendar.category.create');
    Route::post('/calendars/category', [CalendarCategoryController::class, 'store'])->name('calendar.category.store');

    Route::post('/calendar', [ControllersCalendarController::class, 'store'])->name('calendar.store');
    Route::put('/calendar/{model}', [ControllersCalendarController::class, 'update'])->name('calendar.update');
    Route::put('/calendar/{model}/time', [ControllersCalendarController::class, 'updateTime'])->name('calendar.update-time');

});
