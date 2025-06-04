<?php

declare(strict_types=1);

namespace Modules\Upvote\Providers;

use Illuminate\Support\ServiceProvider;
use Modules\Upvote\Contracts\VoteRepositoryInterface;
use Modules\Upvote\Repositories\VoteRepository;

final class UpvoteServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->app->bind(VoteRepositoryInterface::class, VoteRepository::class);
    }

    public function boot(): void {}
}
