<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BoardList;
use App\Models\Card;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CardController extends Controller
{
    /**
     * Display a listing of the cards for a specific list.
     */
    public function index(string $listId): JsonResponse
    {
        $list = BoardList::findOrFail($listId);
        $cards = $list->cards()->with('tags', 'members')->get();

        return response()->json($cards);
    }

    /**
     * Store a newly created card in a specific list.
     */
    public function store(Request $request, string $listId): JsonResponse
    {
        $list = BoardList::findOrFail($listId);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $maxPosition = $list->cards()->max('position') ?? 0;

        $card = $list->cards()->create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'due_date' => $validated['due_date'] ?? null,
            'position' => $maxPosition + 1,
        ]);

        // Load relations for response
        $card->load('tags', 'members');

        return response()->json($card, 201);
    }

    /**
     * Update the specified card in storage.
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'due_date' => 'nullable|date',
        ]);

        $card->update($validated);
        $card->load('tags', 'members');

        return response()->json($card);
    }

    /**
     * Remove the specified card from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->delete();

        return response()->json(['message' => 'Card deleted successfully']);
    }

    /**
     * Move a card to another list and update its position.
     */
    public function move(Request $request, string $id): JsonResponse
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'list_id' => 'required|exists:lists,id',
            'position' => 'required|integer|min:0',
        ]);

        $oldListId = $card->list_id;
        $newListId = $validated['list_id'];
        $newPosition = $validated['position'];

        DB::transaction(function () use ($card, $oldListId, $newListId, $newPosition) {
            // Shift positions of cards in the target list
            Card::where('list_id', $newListId)
                ->where('position', '>=', $newPosition)
                ->increment('position');

            // Update this card's list and position
            $card->update([
                'list_id' => $newListId,
                'position' => $newPosition,
            ]);

            // Resequence positions of cards in the old list (if it changed)
            if ($oldListId != $newListId) {
                $oldListCards = Card::where('list_id', $oldListId)->orderBy('position')->get();
                foreach ($oldListCards as $index => $c) {
                    $c->update(['position' => $index + 1]);
                }
            }

            // Resequence positions of cards in the new list to keep positions clean (1, 2, 3...)
            $newListCards = Card::where('list_id', $newListId)->orderBy('position')->get();
            foreach ($newListCards as $index => $c) {
                $c->update(['position' => $index + 1]);
            }
        });

        $card->load('tags', 'members');

        return response()->json($card);
    }

    /**
     * Add a colored tag/label to a card.
     */
    public function addTag(Request $request, string $id): JsonResponse
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'color' => 'required|string|max:50',
        ]);

        // Find or create the tag globally
        $tag = Tag::firstOrCreate([
            'name' => $validated['name'],
        ], [
            'color' => $validated['color']
        ]);

        // If tag color is different, update it
        if ($tag->color !== $validated['color']) {
            $tag->update(['color' => $validated['color']]);
        }

        // Attach tag to card if not already attached
        if (!$card->tags()->where('tag_id', $tag->id)->exists()) {
            $card->tags()->attach($tag->id);
        }

        $card->load('tags', 'members');

        return response()->json($card);
    }

    /**
     * Remove a tag from a card.
     */
    public function removeTag(string $id, string $tagId): JsonResponse
    {
        $card = Card::findOrFail($id);
        $card->tags()->detach($tagId);

        $card->load('tags', 'members');

        return response()->json($card);
    }

    /**
     * Assign a member to a card.
     */
    public function assignMember(Request $request, string $id): JsonResponse
    {
        $card = Card::findOrFail($id);

        $validated = $request->validate([
            'member_id' => 'required|exists:members,id',
            'action' => 'sometimes|string|in:assign,unassign,toggle', // optional action parameter
        ]);

        $memberId = $validated['member_id'];
        $action = $validated['action'] ?? 'assign';

        if ($action === 'unassign') {
            $card->members()->detach($memberId);
        } elseif ($action === 'assign') {
            if (!$card->members()->where('member_id', $memberId)->exists()) {
                $card->members()->attach($memberId);
            }
        } else { // toggle
            $card->members()->toggle($memberId);
        }

        $card->load('tags', 'members');

        return response()->json($card);
    }
}
