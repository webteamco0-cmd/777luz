<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\DailyInventory;
use App\Models\DailyRate;
use App\Models\RoomType;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class BookingService
{
    private const HOLD_MINUTES = 15;

    public function createHold(
        int $branchId,
        int $roomTypeId,
        string $checkIn,
        string $checkOut,
        string $guestName,
        string $guestPhone,
        int $guestCount,
        ?string $guestEmail = null,
        string $source = 'website',
    ): Booking {
        $checkInDate = CarbonImmutable::parse($checkIn)->startOfDay();
        $checkOutDate = CarbonImmutable::parse($checkOut)->startOfDay();

        if ($checkOutDate->lessThanOrEqualTo($checkInDate)) {
            throw new RuntimeException(
                'Check-out date must be after check-in date.',
            );
        }

        return DB::transaction(function () use (
            $branchId,
            $roomTypeId,
            $checkInDate,
            $checkOutDate,
            $guestName,
            $guestPhone,
            $guestCount,
            $guestEmail,
            $source,
        ) {
            $roomType = RoomType::query()
                ->whereKey($roomTypeId)
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->first();

            if (!$roomType) {
                throw new RuntimeException(
                    'The selected room type is not available for this branch.',
                );
            }

            $stayDates = [];

            for (
                $date = $checkInDate;
                $date->lessThan($checkOutDate);
                $date = $date->addDay()
            ) {
                $stayDates[] = $date->toDateString();
            }

            $inventories = DailyInventory::query()
                ->where('room_type_id', $roomTypeId)
                ->whereDate(
                    'date',
                    '>=',
                    $checkInDate->toDateString(),
                )
                ->whereDate(
                    'date',
                    '<',
                    $checkOutDate->toDateString(),
                )
                ->orderBy('date')
                ->lockForUpdate()
                ->get()
                ->keyBy(
                    fn (DailyInventory $inventory) =>
                        $inventory->date->toDateString(),
                );

            $rates = DailyRate::query()
                ->where('room_type_id', $roomTypeId)
                ->whereDate(
                    'date',
                    '>=',
                    $checkInDate->toDateString(),
                )
                ->whereDate(
                    'date',
                    '<',
                    $checkOutDate->toDateString(),
                )
                ->orderBy('date')
                ->get()
                ->keyBy(
                    fn (DailyRate $rate) =>
                        $rate->date->toDateString(),
                );

            if (
                $inventories->count() !== count($stayDates) ||
                $rates->count() !== count($stayDates)
            ) {
                throw new RuntimeException(
                    'The selected room type is not available for every night of this stay.',
                );
            }

            $nightlyRates = [];
            $subtotal = 0.0;
            $now = now();

            foreach ($stayDates as $date) {
                $inventory = $inventories->get($date);
                $rate = $rates->get($date);

                if (!$inventory || !$rate) {
                    throw new RuntimeException(
                        'Availability or pricing is missing for one or more nights.',
                    );
                }

                $occupiedUnits = Booking::query()
                    ->where('room_type_id', $roomTypeId)
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

                $remainingUnits =
                    (int) $inventory->available_units - $occupiedUnits;

                if ($remainingUnits <= 0) {
                    throw new RuntimeException(
                        'The selected room type is no longer available for the full stay.',
                    );
                }

                $nightlyRate = (float) $rate->price;

                $nightlyRates[] = [
                    'date' => $date,
                    'nightly_rate' => number_format(
                        $nightlyRate,
                        2,
                        '.',
                        '',
                    ),
                ];

                $subtotal += $nightlyRate;
            }

            $booking = Booking::query()->create([
                'booking_reference' => $this->generateReference(),
                'branch_id' => $branchId,
                'room_type_id' => $roomTypeId,
                'check_in' => $checkInDate->toDateString(),
                'check_out' => $checkOutDate->toDateString(),
                'nights_count' => count($stayDates),
                'subtotal' => number_format($subtotal, 2, '.', ''),
                'discount_amount' => '0.00',
                'total_amount' => number_format($subtotal, 2, '.', ''),
                'currency' => 'SAR',
                'source' => $source,
                'status' => 'pending',
                'payment_method' => null,
                'payment_status' => 'pending',
                'guest_name' => trim($guestName),
                'guest_phone' => trim($guestPhone),
                'guest_email' => $guestEmail
                    ? trim($guestEmail)
                    : null,
                'guest_count' => $guestCount,
                'phone_verified' => false,
                'hold_expires_at' => now()->addMinutes(
                    self::HOLD_MINUTES,
                ),
                'coupon_code' => null,
                'confirmed_at' => null,
                'cancelled_at' => null,
            ]);

            $booking->nights()->createMany($nightlyRates);

            return $booking->load([
                'branch',
                'roomType',
                'nights',
            ]);
        }, 5);
    }

    private function generateReference(): string
    {
        do {
            $reference = sprintf(
                'SL-%s-%s',
                now()->format('ymd'),
                Str::upper(Str::random(6)),
            );
        } while (
            Booking::query()
                ->where('booking_reference', $reference)
                ->exists()
        );

        return $reference;
    }
}