<?php

use App\Http\Controllers\Api\BoardController;
use App\Http\Controllers\Api\CardController;
use App\Http\Controllers\Api\ListController;
use App\Http\Controllers\Api\MemberController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Boards
Route::get('/boards', [BoardController::class, 'index']);
Route::post('/boards', [BoardController::class, 'store']);
Route::get('/boards/{id}', [BoardController::class, 'show']);
Route::delete('/boards/{id}', [BoardController::class, 'destroy']);

// Lists
Route::get('/boards/{id}/lists', [ListController::class, 'index']);
Route::post('/boards/{id}/lists', [ListController::class, 'store']);
Route::put('/lists/{id}', [ListController::class, 'update']);
Route::delete('/lists/{id}', [ListController::class, 'destroy']);

// Cards
Route::get('/lists/{id}/cards', [CardController::class, 'index']);
Route::post('/lists/{id}/cards', [CardController::class, 'store']);
Route::put('/cards/{id}', [CardController::class, 'update']);
Route::delete('/cards/{id}', [CardController::class, 'destroy']);
Route::patch('/cards/{id}/move', [CardController::class, 'move']);

// Tags
Route::post('/cards/{id}/tags', [CardController::class, 'addTag']);
Route::delete('/cards/{id}/tags/{tagId}', [CardController::class, 'removeTag']);

// Members
Route::post('/boards/{id}/members', [MemberController::class, 'store']);
Route::post('/cards/{id}/assign', [CardController::class, 'assignMember']);
