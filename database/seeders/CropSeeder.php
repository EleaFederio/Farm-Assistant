<?php

namespace Database\Seeders;

use App\Models\Crop;
use Illuminate\Database\Seeder;

class CropSeeder extends Seeder
{
    public function run(): void
    {
        $crops = [
            ['name' => 'Tomato', 'scientific_name' => 'Solanum lycopersicum', 'category' => 'Vegetables', 'days_to_harvest' => 65, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.8, 'optimal_tds_min' => 1400, 'optimal_tds_max' => 3500, 'optimal_temp_min' => 18, 'optimal_temp_max' => 28],
            ['name' => 'Lettuce', 'scientific_name' => 'Lactuca sativa', 'category' => 'Leafy Greens', 'days_to_harvest' => 30, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.5, 'optimal_tds_min' => 560, 'optimal_tds_max' => 840, 'optimal_temp_min' => 15, 'optimal_temp_max' => 22],
            ['name' => 'Basil', 'scientific_name' => 'Ocimum basilicum', 'category' => 'Herbs', 'days_to_harvest' => 28, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.5, 'optimal_tds_min' => 700, 'optimal_tds_max' => 1750, 'optimal_temp_min' => 18, 'optimal_temp_max' => 30],
            ['name' => 'Cucumber', 'scientific_name' => 'Cucumis sativus', 'category' => 'Vegetables', 'days_to_harvest' => 55, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.8, 'optimal_tds_min' => 1190, 'optimal_tds_max' => 1750, 'optimal_temp_min' => 20, 'optimal_temp_max' => 30],
            ['name' => 'Strawberry', 'scientific_name' => 'Fragaria × ananassa', 'category' => 'Fruits', 'days_to_harvest' => 60, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.5, 'optimal_tds_min' => 1260, 'optimal_tds_max' => 1540, 'optimal_temp_min' => 15, 'optimal_temp_max' => 25],
            ['name' => 'Spinach', 'scientific_name' => 'Spinacia oleracea', 'category' => 'Leafy Greens', 'days_to_harvest' => 25, 'optimal_ph_min' => 6.0, 'optimal_ph_max' => 7.0, 'optimal_tds_min' => 750, 'optimal_tds_max' => 1100, 'optimal_temp_min' => 10, 'optimal_temp_max' => 22],
            ['name' => 'Bell Pepper', 'scientific_name' => 'Capsicum annuum', 'category' => 'Vegetables', 'days_to_harvest' => 70, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.8, 'optimal_tds_min' => 1400, 'optimal_tds_max' => 2100, 'optimal_temp_min' => 18, 'optimal_temp_max' => 28],
            ['name' => 'Mint', 'scientific_name' => 'Mentha', 'category' => 'Herbs', 'days_to_harvest' => 25, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.5, 'optimal_tds_min' => 700, 'optimal_tds_max' => 1400, 'optimal_temp_min' => 15, 'optimal_temp_max' => 25],
            ['name' => 'Kale', 'scientific_name' => 'Brassica oleracea', 'category' => 'Leafy Greens', 'days_to_harvest' => 30, 'optimal_ph_min' => 5.5, 'optimal_ph_max' => 6.5, 'optimal_tds_min' => 1050, 'optimal_tds_max' => 1400, 'optimal_temp_min' => 10, 'optimal_temp_max' => 22],
            ['name' => 'Green Beans', 'scientific_name' => 'Phaseolus vulgaris', 'category' => 'Legumes', 'days_to_harvest' => 50, 'optimal_ph_min' => 6.0, 'optimal_ph_max' => 6.8, 'optimal_tds_min' => 700, 'optimal_tds_max' => 1400, 'optimal_temp_min' => 18, 'optimal_temp_max' => 28],
        ];

        foreach ($crops as $crop) {
            Crop::create($crop);
        }

        $this->command->info('Seeded '.count($crops).' crops');
    }
}
