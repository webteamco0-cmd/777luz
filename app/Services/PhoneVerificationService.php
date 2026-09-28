<?php

namespace App\Services;

use App\Models\Booking;
use App\Models\PhoneVerification;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use RuntimeException;

class PhoneVerificationService
{
    private const CODE_LENGTH = 6;
    private const EXPIRES_MINUTES = 5;
    private const RESEND_SECONDS = 60;
    private const MAX_ATTEMPTS = 5;

    public function sendCode(Booking $booking): array
    {
        if ($booking->phone_verified) {
            throw new RuntimeException(
                'This phone number is already verified.'
            );
        }

        if (!$booking->guest_phone) {
            throw new RuntimeException(
                'This booking does not have a phone number.'
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

        $latestVerification = $booking
            ->phoneVerifications()
            ->latest('id')
            ->first();

        if (
            $latestVerification &&
            !$latestVerification->consumed_at &&
            $latestVerification->resend_available_at &&
            $latestVerification->resend_available_at->isFuture()
        ) {
            throw new RuntimeException(
                'Please wait before requesting another verification code.'
            );
        }

        $booking
            ->phoneVerifications()
            ->whereNull('consumed_at')
            ->update([
                'consumed_at' => now(),
            ]);

        $code = $this->generateCode();

        $verification = $booking
            ->phoneVerifications()
            ->create([
                'phone' => $booking->guest_phone,
                'code_hash' => Hash::make($code),
                'channel' => $this->channel(),
                'provider' => $this->provider(),
                'attempts' => 0,
                'max_attempts' => self::MAX_ATTEMPTS,
                'expires_at' => now()->addMinutes(
                    self::EXPIRES_MINUTES
                ),
                'resend_available_at' => now()->addSeconds(
                    self::RESEND_SECONDS
                ),
                'verified_at' => null,
                'consumed_at' => null,
            ]);

        $this->deliverCode(
            $booking,
            $verification,
            $code
        );

        return [
            'verification' => $verification,
            'development_code' =>
                $this->channel() === 'development'
                    ? $code
                    : null,
        ];
    }

    public function verifyCode(
        Booking $booking,
        string $code,
    ): PhoneVerification {
        if ($booking->phone_verified) {
            throw new RuntimeException(
                'This phone number is already verified.'
            );
        }

        $verification = $booking
            ->phoneVerifications()
            ->whereNull('consumed_at')
            ->latest('id')
            ->first();

        if (!$verification) {
            throw new RuntimeException(
                'No active verification code was found.'
            );
        }

        if ($verification->expires_at->isPast()) {
            $verification->update([
                'consumed_at' => now(),
            ]);

            throw new RuntimeException(
                'The verification code has expired.'
            );
        }

        if (
            $verification->attempts >=
            $verification->max_attempts
        ) {
            $verification->update([
                'consumed_at' => now(),
            ]);

            throw new RuntimeException(
                'The maximum number of verification attempts has been reached.'
            );
        }

        $verification->increment('attempts');
        $verification->refresh();

        if (!Hash::check($code, $verification->code_hash)) {
            if (
                $verification->attempts >=
                $verification->max_attempts
            ) {
                $verification->update([
                    'consumed_at' => now(),
                ]);
            }

            throw new RuntimeException(
                'The verification code is incorrect.'
            );
        }

        $verifiedAt = now();

        $verification->update([
            'verified_at' => $verifiedAt,
            'consumed_at' => $verifiedAt,
        ]);

        $booking->update([
            'phone_verified' => true,
        ]);

        return $verification->fresh();
    }

    private function generateCode(): string
    {
        $minimum = 10 ** (self::CODE_LENGTH - 1);
        $maximum = (10 ** self::CODE_LENGTH) - 1;

        return (string) random_int(
            $minimum,
            $maximum
        );
    }

    private function channel(): string
    {
        return app()->environment('production')
            ? 'sms'
            : 'development';
    }

    private function provider(): ?string
    {
        return app()->environment('production')
            ? config('services.sms.provider')
            : null;
    }

    private function deliverCode(
        Booking $booking,
        PhoneVerification $verification,
        string $code,
    ): void {
        if ($verification->channel === 'development') {
            Log::info('Seven Luz phone verification code', [
                'booking_reference' =>
                    $booking->booking_reference,
                'phone' => $booking->guest_phone,
                'code' => $code,
            ]);

            return;
        }

        throw new RuntimeException(
            'SMS provider is not configured yet.'
        );
    }
}