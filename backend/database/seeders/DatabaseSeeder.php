<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * データベース用のテストデータをシードします。
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            CategorySeeder::class,
            AuthorSeeder::class,
            ArticleSeeder::class,
            CommentSeeder::class,
        ]);
    }
}
