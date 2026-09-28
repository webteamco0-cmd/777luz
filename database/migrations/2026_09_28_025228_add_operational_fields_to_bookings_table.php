<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->string('booking_reference')
                ->unique()
                ->after('id');

            $table->string('currency', 3)
                ->default('SAR')
                ->after('total_amount');

            $table->string('source')
                ->default('website')
                ->after('currency');

            $table->timestamp('hold_expires_at')
                ->nullable()
                ->after('phone_verified');

            $table->index('source');
            $table->index('hold_expires_at');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['source']);
            $table->dropIndex(['hold_expires_at']);

            $table->dropUnique(['booking_reference']);

            $table->dropColumn([
                'booking_reference',
                'currency',
                'source',
                'hold_expires_at',
            ]);
        });
    }
};