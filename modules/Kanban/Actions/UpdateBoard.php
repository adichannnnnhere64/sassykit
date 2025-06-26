<?php

declare(strict_types=1);

namespace Module\Kanban\Actions;

use Module\Kanban\Models\Board;

final class UpdateBoard
{
    public function handle(array $data)
    {
        Board::create($data);
    }
}
