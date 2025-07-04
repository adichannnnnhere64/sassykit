<?php

declare(strict_types=1);

namespace Modules\Calendar\DTOs;

use DateTime;
use Spatie\LaravelData\Attributes\MapInputName;
use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CalendarCategoryData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        public string $color,
        public int $user_id
    ) {}
}
