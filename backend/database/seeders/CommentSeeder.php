<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Comment;
use Illuminate\Database\Seeder;

class CommentSeeder extends Seeder
{
    /**
     * コメントテストデータをシードします。
     */
    public function run(): void
    {
        // 公開済み記事に対してコメントを作成
        $articles = Article::where('is_published', true)->get();
        
        foreach ($articles as $article) {
            // コメント数を更新するための変数
            $commentCount = 0;
            
            // 各記事に対して1〜5個の親コメントを作成
            $parentCommentsCount = rand(1, 5);
            for ($i = 0; $i < $parentCommentsCount; $i++) {
                $parentComment = Comment::create([
                    'article_id' => $article->id,
                    'parent_id' => null,
                    'content' => $this->getRandomComment(),
                    'is_approved' => true,
                ]);
                $commentCount++;
                
                // 各親コメントに0〜3個の返信を作成
                $repliesCount = rand(0, 3);
                for ($j = 0; $j < $repliesCount; $j++) {
                    Comment::create([
                        'article_id' => $article->id,
                        'parent_id' => $parentComment->id,
                        'content' => $this->getRandomReply(),
                        'is_approved' => rand(0, 4) > 0, // 80%の確率で承認済み
                    ]);
                    
                    // 承認済みコメントのみカウント
                    if (rand(0, 4) > 0) {
                        $commentCount++;
                    }
                }
            }
            
            // 未承認のコメントも追加
            $unapprovedCount = rand(0, 2);
            for ($k = 0; $k < $unapprovedCount; $k++) {
                Comment::create([
                    'article_id' => $article->id,
                    'parent_id' => null,
                    'content' => $this->getRandomComment(),
                    'is_approved' => false,
                ]);
                // 未承認なのでカウントに追加しない
            }
            
            // 記事のコメント数を更新
            $article->update([
                'comments_count' => $commentCount
            ]);
        }
    }

    /**
     * ランダムなコメントを生成します
     */
    private function getRandomComment(): string
    {
        $comments = [
            'とても参考になる記事をありがとうございます。特に○○の部分が役立ちました。',
            'この記事のおかげで新しい視点を得ることができました。続きが楽しみです。',
            '初心者にもわかりやすく説明されていて良いですね。もう少し具体例があると更に良いと思います。',
            '長年この分野に関わってきましたが、新しい発見がありました。素晴らしい内容です。',
            'とても興味深い内容でした。関連する○○についても今度記事にしていただけると嬉しいです。',
            'この情報はすぐに実践できそうです。早速試してみます。また結果をコメントします。',
            '図や表が効果的に使われていて、視覚的にも理解しやすかったです。',
            '異なる意見もあるかもしれませんが、バランスの取れた視点で書かれていると思います。',
        ];
        
        return $comments[array_rand($comments)];
    }

    /**
     * ランダムな返信コメントを生成します
     */
    private function getRandomReply(): string
    {
        $replies = [
            'コメントありがとうございます。おっしゃる通りだと思います。',
            '私も同じ経験をしました。共感できる部分が多いです。',
            'その視点は考えていませんでした。とても勉強になります。',
            '追加情報として、○○も役立つかもしれません。参考にしてみてください。',
            'ご質問ありがとうございます。○○については別の記事で詳しく説明する予定です。',
            'その点については少し異なる意見を持っています。◇◇と考えるのはどうでしょうか。',
            'ご指摘の通りです。記事を修正して追記しました。',
            'フィードバックに感謝します。今後の記事作成の参考にします。',
        ];
        
        return $replies[array_rand($replies)];
    }
}
