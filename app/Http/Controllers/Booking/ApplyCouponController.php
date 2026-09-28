<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Services\CouponService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;

class ApplyCouponController extends Controller
{
    public function __invoke(
        Request $request,
        Booking $booking,
        CouponService $couponService,
    ): JsonResponse {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100'],
        ]);

        try {
            $booking = $couponService->apply(
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
                'coupon_code' => $booking->coupon_code,
                'subtotal' => $booking->subtotal,
                'discount_amount' => $booking->discount_amount,
                'total_amount' => $booking->total_amount,
                'currency' => $booking->currency,
            ],
        ]);
    }
}