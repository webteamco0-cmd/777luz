<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_nights', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('date');

            $table->decimal('nightly_rate', 10, 2);

            $table->timestamps();

            $table->unique(['booking_id', 'date']);

            $table->index('date');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_nights');
    }
};