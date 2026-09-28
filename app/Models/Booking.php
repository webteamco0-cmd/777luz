<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Booking extends Model
{
    protected $fillable = [
        'branch_id',
        'room_type_id',
        'check_in',
        'check_out',
        'nights_count',
        'subtotal',
        'discount_amount',
        'total_amount',
        'status',
        'payment_method',
        'payment_status',
        'guest_name',
        'guest_phone',
        'guest_email',
        'guest_count',
        'phone_verified',
        'coupon_code',
        'confirmed_at',
        'cancelled_at',
        'booking_reference',
        'currency',
        'source',
        'hold_expires_at',
        'pay_at_property_deadline',
    ];

    protected function casts(): array
    {
        return [
            'check_in' => 'date',
            'check_out' => 'date',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'phone_verified' => 'boolean',
            'confirmed_at' => 'datetime',
            'cancelled_at' => 'datetime',
            'hold_expires_at' => 'datetime',
            'pay_at_property_deadline' => 'datetime',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }

    public function nights(): HasMany
    {
        return $this->hasMany(BookingNight::class);
    }

    public function phoneVerifications(): HasMany
    {
        return $this->hasMany(PhoneVerification::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}