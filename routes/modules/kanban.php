<?php

declare(strict_types=1);

use App\Http\Controllers\Kanban\BoardCreateController;
use App\Http\Controllers\Kanban\BoardOrderController;
use App\Http\Controllers\Kanban\CardCreateController;
use App\Http\Controllers\Kanban\CardFilesController;
use App\Http\Controllers\Kanban\CardOrderController;
use App\Http\Controllers\Kanban\ColumnCreateController;
use App\Http\Controllers\Kanban\ColumnOrderController;
use Illuminate\Support\Facades\Route;

Route::group(['prefix' => 'boards', 'middleware' => 'auth'], function () {
    Route::get('/', [BoardCreateController::class, 'index'])->name('module.kanban.board.index');
    Route::post('/store', [BoardCreateController::class, 'store'])->name('module.kanban.board.store');
    Route::post('/update', [BoardCreateController::class, 'update'])->name('module.kanban.board.update');
    Route::get('/create', [BoardCreateController::class, 'create'])->name('module.kanban.board.create');
    Route::get('/show/{id}', [BoardCreateController::class, 'show'])->name('module.kanban.board.show');
    Route::get('/edit/{id}', [BoardCreateController::class, 'edit'])->name('module.kanban.board.edit');
    Route::delete('/delete', [BoardCreateController::class, 'destroy'])->name('module.kanban.board.delete');
});

Route::group(['prefix' => 'columns', 'middleware' => 'auth'], function () {
    Route::get('/create/{board_id}', [ColumnCreateController::class, 'create'])->name('module.kanban.column.create');
    Route::post('/reorder-column', [ColumnOrderController::class, 'update'])->name('module.kanban.column.reorder');
    Route::post('/store', [ColumnCreateController::class, 'store'])->name('module.kanban.column.store');
    Route::delete('/delete', [ColumnCreateController::class, 'destroy'])->name('module.kanban.column.delete');
    Route::get('/confirm-delete', [ColumnCreateController::class, 'confirmDelete'])->name('module.kanban.column.confirm-delete');
    Route::patch('/update-title', [ColumnCreateController::class, 'updateTitle'])->name('module.kanban.column.update-title');
});


Route::group(['prefix' => 'cards', 'middleware' => 'auth'], function () {

    Route::get('/create/{column_id}', [CardCreateController::class, 'create'])->name('module.kanban.card.create');
    Route::get('/create-files/{column_id}', [CardFilesController::class, 'create'])->name('module.kanban.card.create-files');

    Route::get('/edit', [CardCreateController::class, 'editCard'])->name('module.kanban.card.edit');

    Route::get('/confirm-delete', [CardCreateController::class, 'confirmDelete'])->name('module.kanban.card.confirm-delete');

    Route::delete('/delete', [CardCreateController::class, 'destroy'])->name('module.kanban.card.delete');
    Route::post('/reorder-card', [BoardOrderController::class, 'update'])->name('module.kanban.card.reorder');
    Route::post('/store', [CardCreateController::class, 'store'])->name('module.kanban.card.store');
    Route::patch('/update', [CardCreateController::class, 'update'])->name('module.kanban.card.update');
    Route::post('/storeFiles', [CardCreateController::class, 'storeFiles'])->name('module.kanban.card.store-files');
    Route::get('/show', [CardCreateController::class, 'show'])->name('module.kanban.card.show');
});
