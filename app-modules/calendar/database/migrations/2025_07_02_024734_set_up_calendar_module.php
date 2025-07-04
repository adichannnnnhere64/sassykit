<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class() extends Migration {
    public function up(): void
    {
        // Calendar Categories Table
        Schema::create('calendar_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('color');
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['user_id', 'name']);
        });

        // Calendar Events Table
        Schema::create('calendar_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start');
            $table->dateTime('end');
            $table->boolean('all_day')->default(false);
            $table->string('location')->nullable();
            $table->string('color')->nullable(); // Allows custom color per event
            $table->timestamps();
            $table->softDeletes();

            $table->index(['user_id', 'start']); // For faster user-specific date queries
        });

        // Event Categories Pivot Table
        Schema::create('calendar_event_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->onDelete('cascade');
            $table->foreignId('calendar_category_id')->constrained('calendar_categories')->onDelete('cascade');
            $table->timestamps();

            $table->unique(['calendar_event_id', 'calendar_category_id']); // Prevent duplicate category assignments
        });

        // Optional: Recurring Events Pattern Table
        Schema::create('calendar_event_recurrences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('calendar_event_id')->constrained('calendar_events')->onDelete('cascade');
            $table->string('recurrence_pattern'); // e.g., 'daily', 'weekly', 'monthly'
            $table->json('recurrence_data')->nullable(); // For complex recurrence rules
            $table->dateTime('end_date')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('calendar_event_recurrences');
        Schema::dropIfExists('calendar_event_categories');
        Schema::dropIfExists('calendar_events');
        Schema::dropIfExists('calendar_categories');
    }
};
