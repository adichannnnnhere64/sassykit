<?php

declare(strict_types=1);

namespace Modules\Tag\Repositories;

use Illuminate\Support\Str;
use Modules\Tag\Contracts\TagRepositoryInterface;
use Modules\Tag\Models\Tag;

final class TagRepository implements TagRepositoryInterface
{
    public function findOrCreateByName(string $name): Tag
    {
        return Tag::firstOrCreate(
            ['slug' => Str::slug($name)],
            ['name' => $name]
        );
    }

    public function findBySlug(string $slug): ?Tag
    {
        return Tag::where('slug', $slug)->first();
    }
}
