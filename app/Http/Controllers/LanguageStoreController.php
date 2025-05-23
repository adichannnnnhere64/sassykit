<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Enums\Language;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

final class LanguageStoreController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        session()->put('language', Language::tryFrom($request->locale)->value ?? config('app.locale'));

        return back();
    }
}
