<?php

declare(strict_types=1);

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Module\Kanban\Actions\CreateCard;
use Module\Kanban\Actions\CreateCardFiles;
use Module\Kanban\Actions\CreateColumn;
use Module\Kanban\Actions\DeleteCard;
use Module\Kanban\Actions\UpdateCard;
use Module\Kanban\DTOs\CardData;
use Module\Kanban\Models\Card;

final class CardCreateController extends Controller
{
    public function create(Request $request, int|string $column_id): Response
    {
        return Inertia::render('modules/kanban/modals/create-card', [
            'column_id' => $column_id,
            'board_id' => $request->only('board_id')['board_id'],
        ]);
    }

    public function storeFiles(Request $request, CreateCardFiles $createCardFiles): RedirectResponse
    {
        $data = $request->validate([
            'board_id' => 'required|exists:Module\Kanban\Models\Board,id',
            'column_id' => 'required',
            'files' => 'array'
        ]);


        $createCardFiles->handle($data, $data['files']);

        return back()->with('success', 'Card created successfully');
    }

    public function store(Request $request, CreateCard $createCard): RedirectResponse
    {
        $data = $request->validate([
            'board_id' => 'required|exists:Module\Kanban\Models\Board,id',
            'column_id' => 'required',
            'content' => 'required'
        ]);

        $createCard->handle($data);

        return back()->with('success', 'Card created successfully');
    }

    public function update(Request $request, UpdateCard $updateCard): RedirectResponse
    {
        $data = $request->validate([
            'card_id' => 'required|exists:Module\Kanban\Models\Card,id',
            'content' => 'nullable',
            'board_id' => 'required|exists:Module\Kanban\Models\Board,id',
        ]);

        $updateCard->handle($data);

        return back()->with('success', 'Card updated successfully')->with('board_id', $data['board_id']);
    }


    public function destroy(Request $request, DeleteCard $deleteCard): RedirectResponse
    {
        $board  = $deleteCard->handle($request->validate([
            'card_id' => 'required|string',
        ]));

        return back()
            ->with('success', 'Card deleted successfully')
            ->with('board_id', $board->id);
    }

    public function confirmDelete(Request $request): Response
    {
        $data = $request->validate([
            'id' => 'required|exists:Module\Kanban\Models\Card,id',
        ]);

        return Inertia::render('modules/kanban/modals/confirm-delete-card', [
            'card_id' => $data['id'],
        ]);
    }

    public function editCard(Request $request): Response
    {
        $data = $request->validate([
            'id' => 'required|exists:Module\Kanban\Models\Card,id'
        ]);

        $card = Card::with('column', 'column.board')->find($data['id']);

        return Inertia::render('modules/kanban/modals/edit-card', [
            'card_id' => $data['id'],
            'card' => CardData::from($card),
            'board_id' => $card->column->board->id
        ]);
    }

    public function show(Request $request): Response
    {
        $data = $request->validate([
            'card_id' => 'required|exists:Module\Kanban\Models\Card,id',
        ]);

        $card = Card::with('column', 'column.board')->find($data['card_id']);

        return Inertia::render('modules/kanban/card/show', [
            'card' => CardData::from($card),
        ]);
    }

}
