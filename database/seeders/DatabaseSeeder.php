<?php

namespace Database\Seeders;

use App\Models\Farm;
use App\Models\User;
use App\Models\Zone;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Farm Owner',
            'email' => 'farm@example.com',
            'role' => 'admin',
        ]);

        $farm = Farm::create([
            'user_id' => $user->id,
            'name' => 'Green Valley Farm',
            'location' => 'Northern Region',
            'description' => 'Main organic farm with greenhouse and outdoor plots.',
        ]);

        $zones = [
            ['farm_id' => $farm->id, 'name' => 'Main Greenhouse', 'type' => 'greenhouse', 'description' => 'Climate-controlled greenhouse'],
            ['farm_id' => $farm->id, 'name' => 'Outdoor Plot A', 'type' => 'outdoor', 'description' => 'South-facing outdoor garden'],
            ['farm_id' => $farm->id, 'name' => 'Hydroponics Room', 'type' => 'hydroponic', 'description' => 'Indoor hydroponic system'],
            ['farm_id' => $farm->id, 'name' => 'Nursery', 'type' => 'nursery', 'description' => 'Seedling propagation area'],
        ];

        foreach ($zones as $zone) {
            Zone::create($zone);
        }

        $this->call([
            CropSeeder::class,
        ]);

        $this->command->info('Farm Assistant database seeded successfully!');
        $this->command->info('Login: farm@example.com / password');
    }
}
