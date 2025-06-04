<?php

declare(strict_types=1);

namespace Modules\Tag\Contracts;

use App\Models\User;

interface TeamRepositoryInterface
{
    public function getUserTeams(User $user);
}
