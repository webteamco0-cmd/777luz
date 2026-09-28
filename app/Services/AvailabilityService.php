<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\RoomType;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use InvalidArgumentException;

class AvailabilityService
{
    public function search(
        int $branchId,
        string $checkIn,
        string $checkOut,
    ): Collection {
        $checkInDate = CarbonImmutable::parse($checkIn)->startOfDay();
        $checkOutDate = CarbonImmutable::parse($checkOut)->startOfDay();

        if ($checkOutDate->lessThanOrEqualTo($checkInDate)) {
            throw new InvalidArgumentException(
                'Check-out date must be after check-in date.'
            );
        }

        $stayDates = collect();

        for (
            $date = $checkInDate;
            $date->lessThan($checkOutDate);
            $date = $date->addDay()
        ) {
            $stayDates->push($date->toDateString());
        }

        $roomTypes = RoomType::query()
            ->where('branch_id', $branchId)
            ->where('is_active', true)
            ->with([
                'dailyRates' => function ($query) use (
                    $checkInDate,
                    $checkOutDate
                ) {
                    $query
                        ->whereDate(
                            'date',
                            '>=',
                            $checkInDate->toDateString()
                        )
                        ->whereDate(
                            'date',
                            '<',
                            $checkOutDate->toDateString()
                        )
                        ->orderBy('date');
                },
                'dailyInventories' => function ($query) use (
                    $checkInDate,
                    $checkOutDate
                ) {
                    $query
                        ->whereDate(
                            'date',
                            '>=',
                            $checkInDate->toDateString()
                        )
                        ->whereDate(
                            'date',
                            '<',
                            $checkOutDate->toDateString()
                        )
                        ->orderBy('date');
                },
            ])
            ->orderBy('display_order')
            ->get();

        $now = now();

        return $roomTypes
            ->map(function (RoomType $roomType) use (
                $stayDates,
                $now
            ) {
                $rates = $roomType->dailyRates->keyBy(
                    fn ($rate) => $rate->date->toDateString()
                );

                $inventories = $roomType->dailyInventories->keyBy(
                    fn ($inventory) => $inventory->date->toDateString()
                );

                $nightlyBreakdown = [];
                $totalPrice = 0.0;
                $minimumAvailableUnits = null;

                foreach ($stayDates as $date) {
                    $rate = $rates->get($date);
                    $inventory = $inventories->get($date);

                    if (!$rate || !$inventory) {
                        return null;
                    }

                    $occupiedUnits = Booking::query()
                        ->where('room_type_id', $roomType->id)
                        ->whereHas('nights', function ($query) use ($date) {
                            $query->whereDate('date', $date);
                        })
                        ->where(function ($query) use ($now) {
                            $query
                                ->where('status', 'confirmed')
                                ->orWhere(function ($pendingQuery) use ($now) {
                                    $pendingQuery
                                        ->where('status', 'pending')
                                        ->whereNotNull('hold_expires_at')
                                        ->where('hold_expires_at', '>', $now);
                                });
                        })
                        ->count();

                    $availableUnits = max(
                        0,
                        (int) $inventory->available_units - $occupiedUnits
                    );

                    if ($availableUnits <= 0) {
                        return null;
                    }

                    $price = (float) $rate->price;

                    $totalPrice += $price;

                    $minimumAvailableUnits =
                        $minimumAvailableUnits === null
                            ? $availableUnits
                            : min(
                                $minimumAvailableUnits,
                                $availableUnits
                            );

                    $nightlyBreakdown[] = [
                        'date' => $date,
                        'price' => number_format(
                            $price,
                            2,
                            '.',
                            ''
                        ),
                        'available_units' => $availableUnits,
                    ];
                }

                return [
                    'room_type_id' => $roomType->id,
                    'slug' => $roomType->slug,
                    'name_ar' => $roomType->name_ar,
                    'name_en' => $roomType->name_en,
                    'short_description_ar' =>
                        $roomType->short_description_ar,
                    'short_description_en' =>
                        $roomType->short_description_en,
                    'available_units' => $minimumAvailableUnits,
                    'nights' => $stayDates->count(),
                    'total_price' => number_format(
                        $totalPrice,
                        2,
                        '.',
                        ''
                    ),
                    'nightly_breakdown' => $nightlyBreakdown,
                ];
            })
            ->filter()
            ->values();
    }
}