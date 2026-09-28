<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();

            $table->string('code')->unique();

            $table->decimal('discount_percentage', 5, 2);

            $table->boolean('is_active')->default(true);

            $table->timestamp('starts_at')->nullable();

            $table->timestamp('ends_at')->nullable();

            $table->unsignedInteger('usage_limit')->nullable();

            $table->unsignedInteger('used_count')->default(0);

            $table->timestamps();

            $table->index([
                'is_active',
                'starts_at',
                'ends_at',
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};