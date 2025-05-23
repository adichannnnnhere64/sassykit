<?php

declare(strict_types=1);

use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\LanguageStoreController;
use App\Http\Controllers\PlanController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('index');
})->name('home');

Route::get('plans', [PlanController::class, 'index'])->name('plans.index')->middleware(['subscribed', 'auth']);

Route::get('checkout', [CheckoutController::class, 'index'])->name('checkout');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');
});

Route::post('language', LanguageStoreController::class)->name('language.store');

Route::get('burat', function () {
    return back()->with('success', 'Totnak');
})->name('burat');

require __DIR__.'/settings.php';
require __DIR__.'/billings.php';
require __DIR__.'/auth.php';
