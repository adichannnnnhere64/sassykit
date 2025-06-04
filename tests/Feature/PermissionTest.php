<?php

declare(strict_types=1);

use App\Models\User;

use function Pest\Laravel\actingAs;

test('custom check-permission works', function () {

    $user = User::factory()->create();

    $check = actingAs($user)
        ->post(route('check-permission', [
            'permission' => 'update team',
            'resource' => null,
        ]));

    expect($check->json()['can'])->toBeTrue();
});
