<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\BoardList;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListController extends Controller
{
    /**
     * Display a listing of lists for a specific board.
     */
    public function index(string $boardId): JsonResponse
    {
        $board = Board::findOrFail($boardId);
        $lists = $board->lists()->with('cards.tags', 'cards.members')->get();

        return response()->json($lists);
    }

    /**
     * Store a newly created list for a specific board.
     */
    public function store(Request $request, string $boardId): JsonResponse
    {
        $board = Board::findOrFail($boardId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        // Find the maximum position currently in this board
        $maxPosition = $board->lists()->max('position') ?? 0;

        $list = $board->lists()->create([
            'name' => $validated['name'],
            'position' => $maxPosition + 1,
        ]);

        return response()->json($list, 201);
    }

    /**
     * Update the specified list (name/position).
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $list = BoardList::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'position' => 'sometimes|required|integer',
        ]);

        $list->update($validated);

        return response()->json($list);
    }

    /**
     * Remove the specified list from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $list = BoardList::findOrFail($id);
        $list->delete();

        return response()->json(['message' => 'List deleted successfully']);
    }
}
