<?php

declare(strict_types=1);

namespace Modules\Calendar\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

final class CalendarEvent extends Model
{
    protected $casts = [
        /* 'priority' => EventPriority::class, */
        /* 'status' => EventStatus::class, */
        'start' => 'datetime',
        'end' => 'datetime',
        'all_day' => 'boolean',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(CalendarCategory::class, 'calendar_event_categories')
            ->withTimestamps();
    }

}
