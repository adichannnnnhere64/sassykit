<?php

declare(strict_types=1);

namespace Modules\Team\DTOs;

use Spatie\LaravelData\Data;
use Spatie\LaravelData\DataCollection;
use Spatie\TypeScriptTransformer\Attributes\TypeScript;

#[TypeScript]
final class TeamData extends Data
{
    public function __construct(
        public int $id,
        public string $name,
        /** @var TeamMemberData[] */
        public DataCollection $members
    ) {}
}
