<?php

declare(strict_types=1);

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Module\Kanban\Models\Board;
use Module\Kanban\Models\Column;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\SocialAccount>
 */
final class ColumnFactory extends Factory
{
    protected $model = Column::class;

    public function definition(): array
    {
        return [
            'title' => $this->faker->title,
            'board_id' => Board::factory()->create()->id,
        ];
    }
}
