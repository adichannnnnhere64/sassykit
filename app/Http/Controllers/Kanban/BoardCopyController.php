<?php

declare(strict_types=1);

namespace App\Http\Controllers\Kanban;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Module\Kanban\Actions\Clipboard;

final class BoardCopyController extends Controller
{
    public function __invoke(Request $request, Clipboard $clipboard)
    {
        return response()->json([
            'clipboard' => $clipboard->handle($request->all()),
        ]);
    }

    public function copyAll(Request $request, Clipboard $clipboard)
    {
        return response()->json([
            'clipboard' => $clipboard->copyAll($request->all()),
        ]);
    }

    public function copyWithTitle(Request $request, Clipboard $clipboard)
    {
        return response()->json([
            'clipboard' => $clipboard->copyWithTitle($request->all()),
        ]);
    }

}
