<?php

namespace Modules\Setting\Http\Controllers;

use App\Http\Controllers\Controller;

final class SettingController extends Controller
{
    public function index()
    {
        return inertia()->render('setting::index', [

        ]);
    }
}
