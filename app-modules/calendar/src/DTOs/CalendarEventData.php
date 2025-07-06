<?php

declare(strict_types=1);

namespace Modules\Calendar\DTOs;

use Carbon\CarbonImmutable;
use Modules\Calendar\Models\CalendarEvent;
use Spatie\LaravelData\Attributes\DataCollectionOf;
use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CalendarEventData extends Data
{
    public function __construct(
        public int $id,
        public int $user_id,
        public string $title,
        public int $amount,
        public ?string $description,
        public CarbonImmutable $start,
        public CarbonImmutable $end,
        public string $color,
        public ?bool $all_day,

        #[DataCollectionOf(CalendarCategoryData::class)]
        public readonly DataCollection $categories,
    ) {}
}
