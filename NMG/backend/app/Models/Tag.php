<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Tag extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'color'];

    /**
     * Get the cards associated with the tag.
     */
    public function cards(): BelongsToMany
    {
        return $this->belongsToMany(Card::class, 'card_tag', 'tag_id', 'card_id');
    }
}
