<?php

declare(strict_types=1);

namespace Module\Kanban\Actions;

use Module\Kanban\Models\Board;

final class Clipboard
{
    public function handle(array $data)
    {
        $column = Board::find($data['board_id'])
            ->columns()
            ->where('title', $data['column_id'])
            ->first();

        return implode("\n\n", $column->cards->pluck('content')->toArray());
    }

    public function copyAll(array $data)
    {
        $board = Board::find($data['board_id']);
        return implode("\n\n", $board->columns->pluck('cards')->flatten()->pluck('content')->toArray());
    }
}
