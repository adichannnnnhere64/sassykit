<?php

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
use Modules\Calendar\Http\Controllers\CalendarController as ControllersCalendarController;
use Modules\Team\Http\Controllers\CalendarController;

Route::get('/calendars', [ ControllersCalendarController::class, 'index' ] );
