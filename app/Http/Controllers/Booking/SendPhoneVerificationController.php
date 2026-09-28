<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PhoneVerificationService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class SendPhoneVerificationController extends Controller
{
    public function __invoke(
        Booking $booking,
        PhoneVerificationService $phoneVerificationService,
    ): JsonResponse {
        try {
            $result = $phoneVerificationService->sendCode($booking);
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        $verification = $result['verification'];

        return response()->json([
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'phone' => $booking->guest_phone,
                'channel' => $verification->channel,
                'expires_at' => $verification->expires_at->toISOString(),
                'resend_available_at' =>
                    $verification->resend_available_at?->toISOString(),

                'development_code' =>
                    $result['development_code'],
            ],
        ]);
    }
}