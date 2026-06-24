<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Board;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    /**
     * Store a newly created member and associate with a board.
     */
    public function store(Request $request, string $boardId): JsonResponse
    {
        $board = Board::findOrFail($boardId);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
        ]);

        // Check if member already exists on this board with the same email
        $member = $board->members()->where('email', $validated['email'])->first();

        if (!$member) {
            $member = $board->members()->create($validated);
        }

        return response()->json($member, 201);
    }
}
