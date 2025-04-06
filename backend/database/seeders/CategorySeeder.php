<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * カテゴリーテストデータをシードします。
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'AI',
                'slug' => 'ai',
                'description' => '人工知能、機械学習、ディープラーニングなどのAI技術に関する記事',
            ],
            [
                'name' => 'バックエンド',
                'slug' => 'backend',
                'description' => 'サーバーサイド開発、データベース、APIなどのバックエンド技術に関する記事',
            ],
            [
                'name' => 'AWS',
                'slug' => 'aws',
                'description' => 'Amazon Web Services、クラウドインフラ、サーバーレスなどのAWSサービスに関する記事',
            ],
            [
                'name' => 'フロントエンド',
                'slug' => 'frontend',
                'description' => 'JavaScript、HTML/CSS、フレームワークなどのフロントエンド開発に関する記事',
            ],
        ];

        foreach ($categories as $category) {
            Category::create([
                'name' => $category['name'],
                'slug' => $category['slug'],
                'description' => $category['description'],
            ]);
        }
    }
}
