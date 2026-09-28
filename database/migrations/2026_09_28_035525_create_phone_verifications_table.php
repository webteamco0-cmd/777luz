<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('phone_verifications', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('phone', 30);

            $table->string('code_hash');

            $table->string('channel')
                ->default('development');

            $table->string('provider')
                ->nullable();

            $table->unsignedSmallInteger('attempts')
                ->default(0);

            $table->unsignedSmallInteger('max_attempts')
                ->default(5);

            $table->timestamp('expires_at');

            $table->timestamp('resend_available_at')
                ->nullable();

            $table->timestamp('verified_at')
                ->nullable();

            $table->timestamp('consumed_at')
                ->nullable();

            $table->timestamps();

            $table->index([
                'booking_id',
                'phone',
            ]);

            $table->index('expires_at');

            $table->index('verified_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('phone_verifications');
    }
};