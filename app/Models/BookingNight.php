<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingNight extends Model
{
    use HasFactory;

    protected $fillable = [
        'booking_id',
        'date',
        'nightly_rate',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'nightly_rate' => 'decimal:2',
        ];
    }

    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class);
    }
}