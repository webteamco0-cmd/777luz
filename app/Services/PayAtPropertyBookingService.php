<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Coupon;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class PayAtPropertyBookingService
{
    public function confirm(Booking $booking): Booking
    {
        return DB::transaction(function () use ($booking) {
            $booking = Booking::query()
                ->with('branch')
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($booking->status !== 'pending') {
                throw new RuntimeException(
                    'Only pending bookings can be confirmed.'
                );
            }

            if ($booking->payment_method !== 'pay_at_property') {
                throw new RuntimeException(
                    'This booking is not set to pay at the property.'
                );
            }

            if (!$booking->phone_verified) {
                throw new RuntimeException(
                    'Phone verification is required before confirming the booking.'
                );
            }

            if (
                $booking->hold_expires_at &&
                $booking->hold_expires_at->isPast()
            ) {
                throw new RuntimeException(
                    'This booking hold has expired.'
                );
            }

            if (!$booking->branch) {
                throw new RuntimeException(
                    'The booking branch could not be found.'
                );
            }

            $branchTimezone = $booking->branch->timezone ?: 'Asia/Riyadh';

            $arrivalDate = $booking->check_in->format('Y-m-d');

            $payAtPropertyDeadline = CarbonImmutable::createFromFormat(
                'Y-m-d H:i:s',
                $arrivalDate . ' 23:00:00',
                $branchTimezone,
            )->utc();

            if ($booking->coupon_code) {
                $coupon = Coupon::query()
                    ->whereRaw('UPPER(code) = ?', [
                        strtoupper($booking->coupon_code),
                    ])
                    ->lockForUpdate()
                    ->first();

                if (!$coupon) {
                    throw new RuntimeException(
                        'The applied coupon could not be found.'
                    );
                }

                if (
                    $coupon->usage_limit !== null &&
                    $coupon->used_count >= $coupon->usage_limit
                ) {
                    throw new RuntimeException(
                        'The applied coupon has reached its usage limit.'
                    );
                }

                $coupon->increment('used_count');
            }

            $booking->update([
                'status' => 'confirmed',
                'payment_status' => 'pending',
                'confirmed_at' => now(),
                'hold_expires_at' => null,
                'pay_at_property_deadline' => $payAtPropertyDeadline,
            ]);

            return $booking->fresh([
                'branch',
                'roomType',
                'nights',
            ]);
        }, 5);
    }
}