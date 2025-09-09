<?php

declare(strict_types=1);

namespace Module\Kanban\Actions;

use Module\Kanban\Models\Board;
use Module\Kanban\Models\Card;

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

        return implode("\n\n", $board->columns()->where('title', $data['column_id'])
            ->pluck('cards')->flatten()->pluck('content')->toArray());
    }

    public function copy(array $data)
    {
        $board = Card::find($data['id'])->content;

        return $board;
    }

    public function copyWithTitle(array $data)
    {
        $board = Board::findOrFail($data['board_id']);
        $lines =  $board->columns()->where('title', $data['column_id'])->first()->cards
            ->map(function ($card, $index) {
                $title = $card?->title ?? '';

                return $title."\n".$card->content;
            });

        return $lines->implode("\n\n");
    }
}
