<?php

namespace Tests\Feature\Booking;

use App\Models\Booking;
use App\Models\Branch;
use App\Models\DailyInventory;
use App\Models\DailyRate;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PhoneVerificationTest extends TestCase
{
    use RefreshDatabase;

    private Booking $booking;

    protected function setUp(): void
    {
        parent::setUp();

        $branch = Branch::query()->create([
            'name_ar' => 'فرع المصيف',
            'name_en' => 'Al Masif Branch',
            'slug' => 'al-masif',
            'address_ar' => 'حي المصيف، الرياض',
            'address_en' => 'Al Masif, Riyadh',
            'timezone' => 'Asia/Riyadh',
            'is_active' => true,
        ]);

        $roomType = RoomType::query()->create([
            'branch_id' => $branch->id,
            'name_ar' => 'استوديو كينغ',
            'name_en' => 'King Studio',
            'slug' => 'king-studio',
            'short_description_ar' => null,
            'short_description_en' => null,
            'max_guests' => null,
            'display_order' => 1,
            'is_active' => true,
        ]);

        DailyRate::query()->create([
            'room_type_id' => $roomType->id,
            'date' => '2026-09-28',
            'price' => 350,
        ]);

        DailyInventory::query()->create([
            'room_type_id' => $roomType->id,
            'date' => '2026-09-28',
            'available_units' => 3,
        ]);

        $this->booking = Booking::query()->create([
            'booking_reference' => 'SL-TEST-OTP001',
            'branch_id' => $branch->id,
            'room_type_id' => $roomType->id,
            'check_in' => '2026-09-28',
            'check_out' => '2026-09-29',
            'nights_count' => 1,
            'subtotal' => '350.00',
            'discount_amount' => '0.00',
            'total_amount' => '350.00',
            'currency' => 'SAR',
            'source' => 'website',
            'status' => 'pending',
            'payment_method' => null,
            'payment_status' => 'pending',
            'guest_name' => 'OTP Test Guest',
            'guest_phone' => '+966500000001',
            'guest_email' => 'otp@example.com',
            'phone_verified' => false,
            'hold_expires_at' => now()->addMinutes(15),
            'coupon_code' => null,
            'confirmed_at' => null,
            'cancelled_at' => null,
        ]);

        $this->booking->nights()->create([
            'date' => '2026-09-28',
            'nightly_rate' => '350.00',
        ]);
    }

    public function test_guest_can_request_phone_verification_code(): void
    {
        $response = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.booking_reference',
                'SL-TEST-OTP001'
            )
            ->assertJsonPath(
                'data.phone',
                '+966500000001'
            )
            ->assertJsonPath(
                'data.channel',
                'development'
            )
            ->assertJsonStructure([
                'data' => [
                    'booking_reference',
                    'phone',
                    'channel',
                    'expires_at',
                    'resend_available_at',
                    'development_code',
                ],
            ]);

        $code = $response->json('data.development_code');

        $this->assertIsString($code);
        $this->assertSame(6, strlen($code));

        $this->assertDatabaseCount(
            'phone_verifications',
            1
        );

        $verification = $this->booking
            ->phoneVerifications()
            ->firstOrFail();

        $this->assertTrue(
            Hash::check($code, $verification->code_hash)
        );

        $this->assertSame(
            0,
            $verification->attempts
        );
    }

    public function test_guest_cannot_request_another_code_before_resend_cooldown(): void
    {
        $firstResponse = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $firstResponse->assertOk();

        $secondResponse = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $secondResponse
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'Please wait before requesting another verification code.'
            );

        $this->assertDatabaseCount(
            'phone_verifications',
            1
        );
    }

    public function test_incorrect_code_is_rejected_and_attempt_is_counted(): void
    {
        $sendResponse = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $sendResponse->assertOk();

        $response = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/verify",
            [
                'code' => '000000',
            ]
        );

        $response
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'The verification code is incorrect.'
            );

        $verification = $this->booking
            ->phoneVerifications()
            ->firstOrFail();

        $this->assertSame(
            1,
            $verification->attempts
        );

        $this->assertFalse(
            $this->booking->fresh()->phone_verified
        );
    }

    public function test_correct_code_verifies_phone_number(): void
    {
        $sendResponse = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $sendResponse->assertOk();

        $code = $sendResponse->json(
            'data.development_code'
        );

        $response = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/verify",
            [
                'code' => $code,
            ]
        );

        $response
            ->assertOk()
            ->assertJsonPath(
                'data.booking_reference',
                'SL-TEST-OTP001'
            )
            ->assertJsonPath(
                'data.phone_verified',
                true
            );

        $this->assertTrue(
            $this->booking->fresh()->phone_verified
        );

        $verification = $this->booking
            ->phoneVerifications()
            ->firstOrFail();

        $this->assertNotNull(
            $verification->verified_at
        );

        $this->assertNotNull(
            $verification->consumed_at
        );
    }

    public function test_used_code_cannot_be_used_again(): void
    {
        $sendResponse = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $code = $sendResponse->json(
            'data.development_code'
        );

        $firstVerify = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/verify",
            [
                'code' => $code,
            ]
        );

        $firstVerify->assertOk();

        $secondVerify = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/verify",
            [
                'code' => $code,
            ]
        );

        $secondVerify
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'This phone number is already verified.'
            );
    }

    public function test_expired_code_is_rejected(): void
    {
        $sendResponse = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/send"
        );

        $sendResponse->assertOk();

        $code = $sendResponse->json(
            'data.development_code'
        );

        $verification = $this->booking
            ->phoneVerifications()
            ->firstOrFail();

        $verification->update([
            'expires_at' => now()->subMinute(),
        ]);

        $response = $this->postJson(
            "/booking/{$this->booking->id}/phone-verification/verify",
            [
                'code' => $code,
            ]
        );

        $response
            ->assertUnprocessable()
            ->assertJsonPath(
                'message',
                'The verification code has expired.'
            );

        $this->assertFalse(
            $this->booking->fresh()->phone_verified
        );

        $this->assertNotNull(
            $verification->fresh()->consumed_at
        );
    }
}