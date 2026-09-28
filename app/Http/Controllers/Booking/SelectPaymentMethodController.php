<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class SelectPaymentMethodController extends Controller
{
    public function __invoke(
        Request $request,
        Booking $booking,
    ): JsonResponse {
        $validated = $request->validate([
            'payment_method' => [
                'required',
                'string',
                'in:pay_now,pay_at_property',
            ],
        ]);

        try {
            if ($booking->status !== 'pending') {
                throw new RuntimeException(
                    'Payment method can only be selected for pending bookings.'
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
                    'Phone verification is required before selecting a payment method.'
                );
            }

            $booking->update([
                'payment_method' => $validated['payment_method'],
            ]);

            $booking->refresh();
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'payment_method' => $booking->payment_method,
                'payment_status' => $booking->payment_status,
                'subtotal' => $booking->subtotal,
                'discount_amount' => $booking->discount_amount,
                'total_amount' => $booking->total_amount,
                'currency' => $booking->currency,
            ],
        ]);
    }
}