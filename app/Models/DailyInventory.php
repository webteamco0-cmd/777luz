<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DailyInventory extends Model
{
    use HasFactory;

    protected $fillable = [
        'room_type_id',
        'date',
        'available_units',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'available_units' => 'integer',
        ];
    }

    public function roomType(): BelongsTo
    {
        return $this->belongsTo(RoomType::class);
    }
}
