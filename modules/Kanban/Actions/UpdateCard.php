<?php

declare(strict_types=1);

namespace Module\Kanban\Actions;

use Module\Kanban\Models\Board;
use Module\Kanban\Models\Card;
use Module\Kanban\Models\Column;

final class UpdateCard
{
    public function handle(array $data): Card
    {
        $card = tap(Card::find($data['card_id']))->update(collect($data)->only('content', 'title')->toArray());
        return $card;
    }
}
