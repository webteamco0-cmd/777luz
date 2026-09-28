<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RoomType extends Model
{
    use HasFactory;

    protected $fillable = [
        'branch_id',
        'name_ar',
        'name_en',
        'slug',
        'short_description_ar',
        'short_description_en',
        'max_guests',
        'display_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'max_guests' => 'integer',
            'display_order' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function dailyRates(): HasMany
    {
        return $this->hasMany(DailyRate::class);
    }

    public function dailyInventories(): HasMany
    {
        return $this->hasMany(DailyInventory::class);
    }
}
