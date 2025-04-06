<?php

namespace Database\Seeders;

use App\Models\Author;
use App\Models\User;
use Illuminate\Database\Seeder;

class AuthorSeeder extends Seeder
{
    /**
     * 著者テストデータをシードします。
     */
    public function run(): void
    {
        // 管理者ユーザーを著者として設定
        $adminUser = User::where('email', 'yumenikki2@gmail.com')->first();
        
        Author::create([
            'user_id' => $adminUser->id,
            'name' => '山田 太郎',
            'bio' => 'テクノロジーとビジネスに関する記事を執筆する専門家です。10年以上のIT業界経験があります。',
            'profile_image' => 'authors/admin.jpg',
        ]);

        // テストユーザーを著者として設定
        $testUser = User::where('email', 'k-tanimoto@mamiya-its.co.jp')->first();
        
        Author::create([
            'user_id' => $testUser->id,
            'name' => '佐藤 花子',
            'bio' => '料理と旅行が好きなフリーランスライター。各地の食文化について執筆しています。',
            'profile_image' => 'authors/user.jpg',
        ]);

        // 追加の著者を作成
        $users = User::whereNotIn('id', [$adminUser->id, $testUser->id])->limit(5)->get();
        
        foreach ($users as $user) {
            Author::factory()->create([
                'user_id' => $user->id,
                'name' => $user->name,
            ]);
        }

        // ユーザーと関連付けのない著者も作成
        Author::factory(3)->create(['user_id' => null]);
    }
}
