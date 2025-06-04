<?php

declare(strict_types=1);

namespace Module\Kanban\Actions;

use Module\Kanban\Models\Board;
use Module\Kanban\Models\Card;

final class CreateCard
{
    public function handle(array $data): Card
    {
        $column = Board::find($data['board_id'])->columns()->where('title', $data['column_id'])->first();

        return $column->cards()->create(collect($data)->only('content')->toArray());
    }
}
