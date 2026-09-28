<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();

            $table->foreignId('branch_id')
                ->constrained()
                ->restrictOnDelete();

            $table->foreignId('room_type_id')
                ->constrained()
                ->restrictOnDelete();

            $table->date('check_in');
            $table->date('check_out');

            $table->unsignedSmallInteger('nights');

            $table->decimal('subtotal', 10, 2);
            $table->decimal('discount_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);

            $table->string('status')->default('pending');
            $table->string('payment_method')->nullable();
            $table->string('payment_status')->default('pending');

            $table->string('guest_name')->nullable();
            $table->string('guest_phone')->nullable();
            $table->string('guest_email')->nullable();

            $table->boolean('phone_verified')->default(false);

            $table->string('coupon_code')->nullable();

            $table->timestamp('confirmed_at')->nullable();
            $table->timestamp('cancelled_at')->nullable();

            $table->timestamps();

            $table->index(['branch_id', 'check_in', 'check_out']);
            $table->index(['room_type_id', 'check_in', 'check_out']);
            $table->index('status');
            $table->index('payment_status');
            $table->index('guest_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};