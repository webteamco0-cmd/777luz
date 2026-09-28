<?php

namespace App\Http\Controllers\Booking;

use App\Http\Controllers\Controller;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use RuntimeException;

class CreateHoldController extends Controller
{
    public function __invoke(
        Request $request,
        BookingService $bookingService,
    ): JsonResponse {
        $validated = $request->validate([
            'branch_id' => [
                'required',
                'integer',
                'exists:branches,id',
            ],
            'room_type_id' => [
                'required',
                'integer',
                'exists:room_types,id',
            ],
            'check_in' => [
                'required',
                'date_format:Y-m-d',
            ],
            'check_out' => [
                'required',
                'date_format:Y-m-d',
                'after:check_in',
            ],
            'guest_name' => [
                'required',
                'string',
                'max:150',
            ],
            'guest_phone' => [
                'required',
                'string',
                'max:30',
            ],
            'guest_email' => [
                'nullable',
                'email',
                'max:255',
            ],
            'guest_count' => [
                'required',
                'integer',
                'min:1',
                'max:20',
            ],
        ]);

        try {
            $booking = $bookingService->createHold(
                branchId: (int) $validated['branch_id'],
                roomTypeId: (int) $validated['room_type_id'],
                checkIn: $validated['check_in'],
                checkOut: $validated['check_out'],
                guestName: $validated['guest_name'],
                guestPhone: $validated['guest_phone'],
                guestCount: (int) $validated['guest_count'],
                guestEmail: $validated['guest_email'] ?? null,
                source: 'website',
            );
        } catch (RuntimeException $exception) {
            throw ValidationException::withMessages([
                'room_type_id' => [
                    $exception->getMessage(),
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'id' => $booking->id,
                'booking_reference' => $booking->booking_reference,
                'branch_id' => $booking->branch_id,
                'room_type_id' => $booking->room_type_id,
                'check_in' => $booking->check_in->toDateString(),
                'check_out' => $booking->check_out->toDateString(),
                'nights_count' => $booking->nights_count,
                'subtotal' => $booking->subtotal,
                'discount_amount' => $booking->discount_amount,
                'total_amount' => $booking->total_amount,
                'currency' => $booking->currency,
                'status' => $booking->status,
                'payment_status' => $booking->payment_status,
                'phone_verified' => $booking->phone_verified,
                'guest_count' => $booking->guest_count,
                'hold_expires_at' => $booking->hold_expires_at?->toISOString(),
                'room_type' => [
                    'id' => $booking->roomType->id,
                    'slug' => $booking->roomType->slug,
                    'name_ar' => $booking->roomType->name_ar,
                    'name_en' => $booking->roomType->name_en,
                ],
                'nights' => $booking->nights
                    ->map(fn ($night) => [
                        'date' => $night->date->toDateString(),
                        'nightly_rate' => $night->nightly_rate,
                    ])
                    ->values(),
            ],
        ], 201);
    }
}