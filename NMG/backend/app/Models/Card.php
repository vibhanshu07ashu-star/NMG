<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Card extends Model
{
    use HasFactory;

    protected $fillable = ['list_id', 'title', 'description', 'position', 'due_date'];

    protected $casts = [
        'due_date' => 'datetime',
    ];

    /**
     * Get the list that contains the card.
     */
    public function list(): BelongsTo
    {
        return $this->belongsTo(BoardList::class, 'list_id');
    }

    /**
     * Get the tags assigned to the card.
     */
    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'card_tag', 'card_id', 'tag_id');
    }

    /**
     * Get the members assigned to the card.
     */
    public function members(): BelongsToMany
    {
        return $this->belongsToMany(Member::class, 'card_member', 'card_id', 'member_id');
    }
}
