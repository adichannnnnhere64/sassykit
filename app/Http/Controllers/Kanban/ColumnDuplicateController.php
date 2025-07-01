<?php

declare(strict_types=1);

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Module\Kanban\Actions\DuplicateColumn;
use Module\Kanban\Models\Board;

final class ColumnDuplicateController extends Controller
{
    public function __invoke(Request $request, DuplicateColumn $duplicateColumn)
    {
        $data = $request->validate([
            'board_id' => 'required|exists:Module\Kanban\Models\Board,id',
            'column_id' => 'required|string',
        ]);

        $board = Board::findOrFail($data['board_id']);
        $column = $board->columns()->where('title', $data['column_id'])->firstOrFail();

        // Generate a unique title
        $newTitle = $this->generateUniqueTitle($board, $column->title);

        // Duplicate the column
        $newColumn = $column->replicate();
        $newColumn->board_id = $board->id;
        $newColumn->title = $newTitle;
        $newColumn->save();

        // Duplicate the cards
        foreach ($column->cards as $card) {
            $newCard = $card->replicate();
            $newCard->column_id = $newColumn->id;
            $newCard->save();
        }

        return response()->json([
            'new_column' => $newColumn->load('cards'),
        ]);
    }

    protected function generateUniqueTitle(Board $board, string $baseTitle): string
    {
        $title = $baseTitle.' (Copy)';
        $counter = 2;

        while ($board->columns()->where('title', $title)->exists()) {
            $title = $baseTitle." (Copy {$counter})";
            $counter++;
        }

        return $title;
    }
}
