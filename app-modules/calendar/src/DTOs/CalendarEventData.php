<?php

declare(strict_types=1);

namespace Modules\Calendar\DTOs;

use DateTime;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CalendarEventData extends Data
{
    public function __construct(
        public int $id,
        public int $user_id,
        public ?int $category_id,
        public string $title,
        public ?string $description,
        public DateTime $start,
        public DateTime $end,
        public bool $all_day,
    ) {}
}
