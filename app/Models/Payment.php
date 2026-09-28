<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends Model
{
    protected $fillable = [
        'booking_id',
        'provider',
        'payment_reference',
        'provider_transaction_id',
        'amount',
        'currency',
        'status',
        'payment_url',
        'initiated_at',
        'paid_at',
        'failed_at',
        'cancelled_at',
        'provider_payload',
        'webhook_payload',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'initiated_at' => 'datetime',
            'paid_at' => 'datetime',
            'failed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'provider_payload' => 'array',
            'webhook_payload' => 'array',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}