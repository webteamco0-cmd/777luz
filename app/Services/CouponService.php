<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Coupon;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class CouponService
{
    public function apply(
        Booking $booking,
        string $code,
    ): Booking {
        $normalizedCode = strtoupper(trim($code));

        if ($normalizedCode === '') {
            throw new RuntimeException(
                'Coupon code is required.'
            );
        }

        if ($booking->status !== 'pending') {
            throw new RuntimeException(
                'Coupons can only be applied to pending bookings.'
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

        if (!$booking->phone_verified) {
            throw new RuntimeException(
                'Phone verification is required before applying a coupon.'
            );
        }

        return DB::transaction(function () use (
            $booking,
            $normalizedCode,
        ) {
            $coupon = Coupon::query()
                ->whereRaw('UPPER(code) = ?', [$normalizedCode])
                ->lockForUpdate()
                ->first();

            if (!$coupon) {
                throw new RuntimeException(
                    'The coupon code is invalid.'
                );
            }

            if (!$coupon->is_active) {
                throw new RuntimeException(
                    'This coupon is not active.'
                );
            }

            $now = now();

            if (
                $coupon->starts_at &&
                $coupon->starts_at->isFuture()
            ) {
                throw new RuntimeException(
                    'This coupon is not active yet.'
                );
            }

            if (
                $coupon->ends_at &&
                $coupon->ends_at->isPast()
            ) {
                throw new RuntimeException(
                    'This coupon has expired.'
                );
            }

            if (
                $coupon->usage_limit !== null &&
                $coupon->used_count >= $coupon->usage_limit
            ) {
                throw new RuntimeException(
                    'This coupon has reached its usage limit.'
                );
            }

            $percentage = (float) $coupon->discount_percentage;

            if ($percentage <= 0 || $percentage > 100) {
                throw new RuntimeException(
                    'This coupon has an invalid discount percentage.'
                );
            }

            $subtotal = (float) $booking->subtotal;

            $discountAmount = round(
                $subtotal * ($percentage / 100),
                2
            );

            $totalAmount = max(
                0,
                round($subtotal - $discountAmount, 2)
            );

            $booking->update([
                'coupon_code' => $coupon->code,
                'discount_amount' => number_format(
                    $discountAmount,
                    2,
                    '.',
                    ''
                ),
                'total_amount' => number_format(
                    $totalAmount,
                    2,
                    '.',
                    ''
                ),
            ]);

            return $booking->fresh();
        }, 5);
    }
}