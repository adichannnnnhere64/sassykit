<?php

declare(strict_types=1);

namespace Modules\Tag\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Modules\Tag\Database\Factories\TagFactory;

final class Tag extends Model
{
    use HasFactory;

    protected static function newFactory()
    {
        return TagFactory::new();
    }
}
