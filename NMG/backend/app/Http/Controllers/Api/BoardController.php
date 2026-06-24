<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BoardController extends Controller
{
    /**
     * Display a listing of the boards.
     */
    public function index(): JsonResponse
    {
        $boards = Board::with('members')->get();
        return response()->json($boards);
    }

    /**
     * Store a newly created board in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $board = Board::create($validated);

        return response()->json($board, 201);
    }

    /**
     * Display the specified board with lists, cards (with tags and members), and board members.
     */
    public function show(string $id): JsonResponse
    {
        $board = Board::with([
            'lists.cards.tags',
            'lists.cards.members',
            'members'
        ])->findOrFail($id);

        return response()->json($board);
    }

    /**
     * Remove the specified board from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $board = Board::findOrFail($id);
        $board->delete();

        return response()->json(['message' => 'Board deleted successfully']);
    }
}
