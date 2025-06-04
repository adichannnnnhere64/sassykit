<?php

declare(strict_types=1);

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Module\Kanban\Actions\UpdateCardOrder;

final class CardOrderController extends Controller
{
    public function update(Request $request, UpdateCardOrder $updateCardOrder): RedirectResponse
    {
        $data = $request->validate([
            'order' => 'required|array',
            'board_id' => 'required',
            'column_id' => 'required',
        ]);

        $updateCardOrder->handle($data);

        return back();
    }
}
