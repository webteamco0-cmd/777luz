<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_types', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('name_ar');
            $table->string('name_en');
            $table->string('slug');

            $table->text('short_description_ar')->nullable();
            $table->text('short_description_en')->nullable();

            $table->unsignedSmallInteger('max_guests')
                ->nullable()
                ->default(null);

            $table->unsignedSmallInteger('display_order')
                ->default(0);

            $table->boolean('is_active')
                ->default(true);

            $table->timestamps();

            $table->unique([
                'branch_id',
                'slug',
            ]);

            $table->index([
                'branch_id',
                'is_active',
                'display_order',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_types');
    }
};