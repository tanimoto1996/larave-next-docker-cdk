<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * ユーザーテストデータをシードします。
     */
    public function run(): void
    {
        // 管理者ユーザーを作成
        User::create([
            'name' => '管理者',
            'email' => 'yumenikki2@gmail.com',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // テスト用ユーザーを作成
        User::create([
            'name' => 'テストユーザー',
            'email' => 'k-tanimoto@mamiya-its.co.jp',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // ファクトリーを使用して追加のユーザーを作成
        User::factory(10)->create();
    }
}
