<?php

declare(strict_types=1);

namespace Modules\Upvote\Traits;

use Illuminate\Database\Eloquent\Relations\MorphMany;
use Modules\Upvote\Models\Vote;

trait WithVotes
{
    public function votes(): MorphMany
    {
        return $this->morphMany(Vote::class, 'votable');
    }

    public function upvotes()
    {
        return $this->votes()->where('type', 'up');
    }

    public function downvotes()
    {
        return $this->votes()->where('type', 'down');
    }

    public function voteScore(): int
    {
        return $this->upvotes()->count() - $this->downvotes()->count();
    }
}
