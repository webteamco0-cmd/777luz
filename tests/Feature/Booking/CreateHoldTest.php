<?php

namespace Tests\Feature\Booking;

use App\Models\Branch;
use App\Models\DailyInventory;
use App\Models\DailyRate;
use App\Models\RoomType;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CreateHoldTest extends TestCase
{
    use RefreshDatabase;

    private Branch $branch;
    private RoomType $roomType;

    protected function setUp(): void
    {
        parent::setUp();

        $this->branch = Branch::query()->create([
            'name_ar' => 'فرع المصيف',
            'name_en' => 'Al Masif Branch',
            'slug' => 'al-masif',
            'address_ar' => 'حي المصيف، الرياض',
            'address_en' => 'Al Masif, Riyadh',
            'timezone' => 'Asia/Riyadh',
            'is_active' => true,
        ]);

        $this->roomType = RoomType::query()->create([
            'branch_id' => $this->branch->id,
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
            'room_type_id' => $this->roomType->id,
            'date' => '2026-09-28',
            'price' => 350,
        ]);

        DailyRate::query()->create([
            'room_type_id' => $this->roomType->id,
            'date' => '2026-09-29',
            'price' => 420,
        ]);

        DailyInventory::query()->create([
            'room_type_id' => $this->roomType->id,
            'date' => '2026-09-28',
            'available_units' => 3,
        ]);

        DailyInventory::query()->create([
            'room_type_id' => $this->roomType->id,
            'date' => '2026-09-29',
            'available_units' => 3,
        ]);
    }

    public function test_guest_can_create_booking_hold(): void
    {
        $response = $this->postJson('/booking/hold', [
            'branch_id' => $this->branch->id,
            'room_type_id' => $this->roomType->id,
            'check_in' => '2026-09-28',
            'check_out' => '2026-09-30',
            'guest_name' => 'API Test Guest',
            'guest_phone' => '+966544444444',
            'guest_email' => 'api@example.com',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath(
                'data.room_type_id',
                $this->roomType->id
            )
            ->assertJsonPath(
                'data.nights_count',
                2
            )
            ->assertJsonPath(
                'data.total_amount',
                '770.00'
            )
            ->assertJsonPath(
                'data.currency',
                'SAR'
            )
            ->assertJsonPath(
                'data.status',
                'pending'
            )
            ->assertJsonPath(
                'data.payment_status',
                'pending'
            )
            ->assertJsonPath(
                'data.phone_verified',
                false
            );

        $this->assertDatabaseHas('bookings', [
            'branch_id' => $this->branch->id,
            'room_type_id' => $this->roomType->id,
            'nights_count' => 2,
            'subtotal' => 770,
            'total_amount' => 770,
            'status' => 'pending',
            'payment_status' => 'pending',
            'guest_phone' => '+966544444444',
            'source' => 'website',
        ]);

        $this->assertDatabaseCount('booking_nights', 2);
    }

    public function test_required_booking_fields_are_validated(): void
    {
        $response = $this->postJson('/booking/hold', []);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'branch_id',
                'room_type_id',
                'check_in',
                'check_out',
                'guest_name',
                'guest_phone',
            ]);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_check_out_must_be_after_check_in(): void
    {
        $response = $this->postJson('/booking/hold', [
            'branch_id' => $this->branch->id,
            'room_type_id' => $this->roomType->id,
            'check_in' => '2026-09-30',
            'check_out' => '2026-09-28',
            'guest_name' => 'Invalid Date Guest',
            'guest_phone' => '+966555555555',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'check_out',
            ]);

        $this->assertDatabaseCount('bookings', 0);
    }

    public function test_hold_is_rejected_when_inventory_is_fully_occupied(): void
    {
        for ($index = 1; $index <= 3; $index++) {
            $response = $this->postJson('/booking/hold', [
                'branch_id' => $this->branch->id,
                'room_type_id' => $this->roomType->id,
                'check_in' => '2026-09-28',
                'check_out' => '2026-09-30',
                'guest_name' => "Guest {$index}",
                'guest_phone' => "+96650000000{$index}",
            ]);

            $response->assertCreated();
        }

        $response = $this->postJson('/booking/hold', [
            'branch_id' => $this->branch->id,
            'room_type_id' => $this->roomType->id,
            'check_in' => '2026-09-28',
            'check_out' => '2026-09-30',
            'guest_name' => 'Fourth Guest',
            'guest_phone' => '+966599999999',
        ]);

        $response
            ->assertUnprocessable()
            ->assertJsonValidationErrors([
                'room_type_id',
            ]);

        $this->assertDatabaseCount('bookings', 3);
        $this->assertDatabaseCount('booking_nights', 6);
    }
}