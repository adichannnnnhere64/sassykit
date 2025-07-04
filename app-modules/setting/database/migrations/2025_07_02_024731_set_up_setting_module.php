<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration
{
    public function up(): void
    {
        Schema::create('model_settings', function (Blueprint $table) {
            $table->id();
            $table->morphs('settable'); // Creates settable_id and settable_type columns
            $table->string('key');
            $table->json('value');
            $table->string('type'); // 'string', 'integer', 'boolean', 'array', 'float'
            $table->timestamps();

            $table->unique(['settable_type', 'settable_id', 'key']);
            $table->index(['settable_type', 'settable_id', 'key']);
        });

        // Schema::create('calendar', function(Blueprint $table) {
        // 	$table->bigIncrements('id');
        // 	$table->timestamps();
        // 	$table->softDeletes();
        // });
    }

    public function down(): void
    {
        // Don't listen to the haters
        // Schema::dropIfExists('calendar');
    }
};
