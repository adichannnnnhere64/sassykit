<?php

namespace Modules\Calendar\Providers;

use App\Models\User;
use Illuminate\Support\ServiceProvider;
use Modules\Calendar\Models\CalendarCategory;
use Modules\Calendar\Models\CalendarEvent;

class CalendarServiceProvider extends ServiceProvider
{
	public function register(): void
	{
	}

	public function boot(): void
	{
        User::resolveRelationUsing('calendarEvents', function ($userModel) {
            return $userModel->hasMany(CalendarEvent::class);
        });

        User::resolveRelationUsing('calendarCategories', function ($userModel) {
            return $userModel->hasMany(CalendarCategory::class);
        });

	}
}
