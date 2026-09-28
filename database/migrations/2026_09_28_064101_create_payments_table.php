<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();

            $table->foreignId('booking_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('provider')->nullable();

            $table->string('payment_reference')
                ->unique();

            $table->string('provider_transaction_id')
                ->nullable()
                ->index();

            $table->decimal('amount', 10, 2);

            $table->string('currency', 3)
                ->default('SAR');

            $table->string('status')
                ->default('pending')
                ->index();

            $table->string('payment_url')
                ->nullable();

            $table->timestamp('initiated_at')
                ->nullable();

            $table->timestamp('paid_at')
                ->nullable();

            $table->timestamp('failed_at')
                ->nullable();

            $table->timestamp('cancelled_at')
                ->nullable();

            $table->json('provider_payload')
                ->nullable();

            $table->json('webhook_payload')
                ->nullable();

            $table->timestamps();

            $table->index([
                'booking_id',
                'status',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};