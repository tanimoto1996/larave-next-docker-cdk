<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Author>
 */
class AuthorFactory extends Factory
{
    /**
     * モデルのデフォルト状態の定義
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake('ja_JP')->name(),
            'bio' => fake('ja_JP')->paragraph(3),
            'profile_image' => 'authors/author-' . fake()->numberBetween(1, 10) . '.jpg',
        ];
    }
}
