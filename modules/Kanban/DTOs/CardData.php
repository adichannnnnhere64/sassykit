<?php

declare(strict_types=1);

namespace Module\Kanban\DTOs;

use Spatie\LaravelData\Data;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class CardData extends Data
{
    public function __construct(
        public int $id,
        public string $content,
        public string $image,
    ) {}
}
