<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class StartPaymentController extends Controller
{
    public function __invoke(
        Booking $booking,
        PaymentService $paymentService,
    ): JsonResponse {
        try {
            $payment = $paymentService->createAttempt($booking);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'payment_reference' => $payment->payment_reference,
                'booking_reference' => $payment->booking->booking_reference,
                'status' => $payment->status,
                'amount' => $payment->amount,
                'currency' => $payment->currency,
                'provider' => $payment->provider,
                'payment_url' => $payment->payment_url,
                'initiated_at' => $payment->initiated_at?->toISOString(),
            ],
        ], 201);
    }
}