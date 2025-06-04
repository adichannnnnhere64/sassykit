<?php

declare(strict_types=1);

namespace Modules\Upvote\Models;

use Illuminate\Database\Eloquent\Model;

final class Vote extends Model
{
    protected $fillable = ['user_id', 'type'];

    public function votable()
    {
        return $this->morphTo();
    }
}
