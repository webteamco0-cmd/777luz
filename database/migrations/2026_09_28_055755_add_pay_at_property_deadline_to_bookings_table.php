<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('pay_at_property_deadline')
                ->nullable()
                ->after('hold_expires_at');

            $table->index('pay_at_property_deadline');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['pay_at_property_deadline']);
            $table->dropColumn('pay_at_property_deadline');
        });
    }
};