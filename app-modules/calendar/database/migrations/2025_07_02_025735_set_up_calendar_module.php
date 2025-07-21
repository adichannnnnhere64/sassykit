<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
	public function up(): void
	{

        Schema::table('calendar_events', function (Blueprint $table) {
            $table->decimal('amount')->default(0)->change();
        });
		// Schema::create('calendar', function(Blueprint $table) {
		// 	$table->bigIncrements('id');
		// 	$table->timestamps();
		// 	$table->softDeletes();
		// });
	}

	public function down(): void
	{

        Schema::table('calendar_events', function (Blueprint $table) {
            $table->dropColumn('amount');
        });
		// Don't listen to the haters
		// Schema::dropIfExists('calendar');
	}
};
