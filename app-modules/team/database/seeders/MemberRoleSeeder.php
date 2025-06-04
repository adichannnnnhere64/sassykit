<?php

declare(strict_types=1);

namespace Modules\Team\Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class MemberRoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $role = Role::firstOrCreate(['name' => 'team member', 'guard_name' => 'web']);

        $role->givePermissionTo(Permission::firstOrCreate(['name' => 'view team members', 'guard_name' => 'web']));

    }
}
