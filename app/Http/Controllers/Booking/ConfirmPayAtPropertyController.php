<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PayAtPropertyBookingService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ConfirmPayAtPropertyController extends Controller
{
    public function __invoke(
        Booking $booking,
        PayAtPropertyBookingService $service,
    ): JsonResponse {
        try {
            $booking = $service->confirm($booking);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'status' => $booking->status,
                'payment_method' => $booking->payment_method,
                'payment_status' => $booking->payment_status,
                'total_amount' => $booking->total_amount,
                'currency' => $booking->currency,
                'confirmed_at' => $booking->confirmed_at?->toISOString(),
                'pay_at_property_deadline' => $booking
                    ->pay_at_property_deadline
                    ?->toISOString(),
            ],
        ]);
    }
}