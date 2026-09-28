<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\PhoneVerificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class VerifyPhoneVerificationController extends Controller
{
    public function __invoke(
        Request $request,
        Booking $booking,
        PhoneVerificationService $phoneVerificationService,
    ): JsonResponse {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'size:6',
            ],
        ]);

        try {
            $verification = $phoneVerificationService->verifyCode(
                $booking,
                $validated['code'],
            );
        } catch (RuntimeException $exception) {
            return response()->json([
                'message' => $exception->getMessage(),
            ], 422);
        }

        return response()->json([
            'data' => [
                'booking_reference' => $booking->booking_reference,
                'phone_verified' => true,
                'verified_at' => $verification->verified_at?->toISOString(),
            ],
        ]);
    }
}