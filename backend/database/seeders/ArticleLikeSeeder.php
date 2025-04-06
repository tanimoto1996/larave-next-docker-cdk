<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\ArticleLike;
use App\Models\User;
use Illuminate\Database\Seeder;

class ArticleLikeSeeder extends Seeder
{
    /**
     * 記事いいねテストデータをシードします。
     */
    public function run(): void
    {
        $users = User::all();
        $articles = Article::where('is_published', true)->get();
        
        foreach ($articles as $article) {
            // likes_countの値に基づいてユーザーをランダムに選んでいいねを付ける
            $likesCount = $article->likes_count;
            
            // ユーザー数よりいいね数が多い場合は調整
            if ($likesCount > $users->count()) {
                $likesCount = $users->count();
            }
            
            // いいねするユーザーをランダムに選択
            $likedUsers = $users->random($likesCount);
            
            // いいねを登録
            foreach ($likedUsers as $user) {
                ArticleLike::create([
                    'user_id' => $user->id,
                    'article_id' => $article->id,
                ]);
            }
        }
    }
}
