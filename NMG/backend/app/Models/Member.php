<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Member extends Model
{
    use HasFactory;

    protected $fillable = ['board_id', 'name', 'email'];

    /**
     * Get the board that the member belongs to.
     */
    public function board(): BelongsTo
    {
        return $this->belongsTo(Board::class);
    }

    /**
     * Get the cards assigned to this member.
     */
    public function cards(): BelongsToMany
    {
        return $this->belongsToMany(Card::class, 'card_member', 'member_id', 'card_id');
    }
}
