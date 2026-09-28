<?php

namespace Database\Seeders;

use App\Models\Branch;
use App\Models\RoomType;
use Illuminate\Database\Seeder;

class BookingFoundationSeeder extends Seeder
{
    public function run(): void
    {
        $branch = Branch::updateOrCreate(
            ['slug' => 'al-masif'],
            [
                'name_ar' => 'فرع المصيف',
                'name_en' => 'Al Masif Branch',
                'address_ar' => 'حي المصيف، شارع أبي بكر الصديق الفرعي، الرياض',
                'address_en' => 'Al Masif, Abi Bakr As Siddiq Branch Road, Riyadh',
                'timezone' => 'Asia/Riyadh',
                'is_active' => true,
            ],
        );

        $roomTypes = [
            [
                'slug' => 'king-studio',
                'name_ar' => 'استوديو كينغ',
                'name_en' => 'King Studio',
                'max_guests' => null,
                'display_order' => 1,
            ],
            [
                'slug' => 'twin-room',
                'name_ar' => 'غرفة توين',
                'name_en' => 'Twin Room',
                'max_guests' => null,
                'display_order' => 2,
            ],
            [
                'slug' => 'premium-1br',
                'name_ar' => 'بريميوم غرفة وصالة',
                'name_en' => 'Premium 1 Bedroom + Living',
                'max_guests' => null,
                'display_order' => 3,
            ],
            [
                'slug' => 'superior-2br',
                'name_ar' => 'سوبيريور غرفتين وصالة',
                'name_en' => 'Superior 2 Bedroom + Living',
                'max_guests' => null,
                'display_order' => 4,
            ],
            [
                'slug' => 'premium-3br',
                'name_ar' => 'بريميوم ثلاث غرف وصالة',
                'name_en' => 'Premium 3 Bedroom + Living',
                'max_guests' => null,
                'display_order' => 5,
            ],
        ];

        foreach ($roomTypes as $roomType) {
            RoomType::updateOrCreate(
                [
                    'branch_id' => $branch->id,
                    'slug' => $roomType['slug'],
                ],
                [
                    ...$roomType,
                    'branch_id' => $branch->id,
                    'is_active' => true,
                ],
            );
        }
    }
}