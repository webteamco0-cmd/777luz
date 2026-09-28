<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\Payment;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class PaymentService
{
    public function createAttempt(Booking $booking): Payment
    {
        return DB::transaction(function () use ($booking) {
            $booking = Booking::query()
                ->lockForUpdate()
                ->findOrFail($booking->id);

            if ($booking->status !== 'pending') {
                throw new RuntimeException(
                    'Payment can only be started for pending bookings.'
                );
            }

            if ($booking->payment_method !== 'pay_now') {
                throw new RuntimeException(
                    'This booking is not set to pay now.'
                );
            }

            if (!$booking->phone_verified) {
                throw new RuntimeException(
                    'Phone verification is required before starting payment.'
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

            if ((float) $booking->total_amount <= 0) {
                throw new RuntimeException(
                    'The booking total must be greater than zero.'
                );
            }

            $existingPayment = Payment::query()
                ->where('booking_id', $booking->id)
                ->where('status', 'pending')
                ->latest('id')
                ->first();

            if ($existingPayment) {
                return $existingPayment;
            }

            return Payment::query()->create([
                'booking_id' => $booking->id,
                'provider' => null,
                'payment_reference' => $this->generateReference(),
                'provider_transaction_id' => null,
                'amount' => $booking->total_amount,
                'currency' => $booking->currency,
                'status' => 'pending',
                'payment_url' => null,
                'initiated_at' => now(),
                'paid_at' => null,
                'failed_at' => null,
                'cancelled_at' => null,
                'provider_payload' => null,
                'webhook_payload' => null,
            ]);
        }, 5);
    }

    private function generateReference(): string
    {
        do {
            $reference = sprintf(
                'PAY-%s-%s',
                now()->format('ymdHis'),
                Str::upper(Str::random(8)),
            );
        } while (
            Payment::query()
                ->where('payment_reference', $reference)
                ->exists()
        );

        return $reference;
    }
}