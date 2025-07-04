<?php

declare(strict_types=1);

namespace Modules\Calendar\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class CalendarCategory extends Model
{

    public function events(): BelongsToMany
    {
        return $this->belongsToMany(CalendarEvent::class, 'calendar_event_categories')
            ->withTimestamps();
    }

}
