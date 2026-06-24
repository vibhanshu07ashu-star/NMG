<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Board extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'description'];

    /**
     * Get the lists for the board.
     */
    public function lists(): HasMany
    {
        return $this->hasMany(BoardList::class, 'board_id')->orderBy('position');
    }

    /**
     * Get the members associated with the board.
     */
    public function members(): HasMany
    {
        return $this->hasMany(Member::class, 'board_id');
    }
}
