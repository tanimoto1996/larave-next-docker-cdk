<?php

namespace Database\Seeders;

use App\Models\Article;
use App\Models\Author;
use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ArticleSeeder extends Seeder
{
    /**
     * 記事テストデータをシードします。
     */
    public function run(): void
    {
        $authors = Author::all();
        $categories = Category::all();
        
        // 各カテゴリーに記事を作成
        foreach ($categories as $category) {
            // 公開済み記事
            for ($i = 0; $i < 5; $i++) {
                $title = $this->getRandomTitle($category->name, $i);
                
                Article::create([
                    'category_id' => $category->id,
                    'author_id' => $authors->random()->id,
                    'title' => $title,
                    'slug' => Str::slug($title) . '-' . rand(1000, 9999),
                    'excerpt' => $this->getRandomExcerpt(),
                    'content' => $this->getRandomContent(),
                    'image' => 'articles/' . strtolower($category->slug) . '-' . rand(1, 5) . '.jpg',
                    'is_published' => true,
                    'published_at' => now()->subDays(rand(1, 30)),
                    'likes_count' => rand(0, 100),
                    'comments_count' => rand(0, 20),
                ]);
            }
            
            // 下書き記事
            Article::create([
                'category_id' => $category->id,
                'author_id' => $authors->random()->id,
                'title' => '【下書き】' . $this->getRandomTitle($category->name, 99),
                'slug' => 'draft-' . $category->slug . '-' . rand(1000, 9999),
                'excerpt' => $this->getRandomExcerpt(),
                'content' => $this->getRandomContent(),
                'image' => null,
                'is_published' => false,
                'published_at' => null,
            ]);
        }
    }

    /**
     * カテゴリーに応じたランダムなタイトルを生成します
     */
    private function getRandomTitle($category, $index): string
    {
        $titles = [
            'AI' => [
                'ChatGPTが変えるコミュニケーションの未来',
                'ディープラーニングモデルの最適化テクニック',
                '画像認識AIの医療分野での応用',
                '自然言語処理の最新ブレイクスルー',
                'AIと倫理：開発における重要な考慮点'
            ],
            'バックエンド' => [
                'マイクロサービスアーキテクチャの実践ガイド',
                'RESTful APIの設計ベストプラクティス',
                'NoSQLデータベース選定の重要ポイント',
                'バックエンドパフォーマンスチューニングの技法',
                'WebSocketによるリアルタイム通信の実装'
            ],
            'AWS' => [
                'AWSコスト最適化の秘訣',
                'ServerlessフレームワークによるLambda開発',
                'Amazon S3の効率的な使用パターン',
                'ECSとEKSの比較：コンテナ戦略',
                'AWSセキュリティベストプラクティス'
            ],
            'フロントエンド' => [
                'ReactとVueの実践的比較',
                'CSSグリッドとFlexboxのマスターガイド',
                'フロントエンドパフォーマンス最適化テクニック',
                'WebAssemblyがもたらす新時代',
                'TypeScriptで型安全なフロントエンド開発'
            ]
        ];

        if (isset($titles[$category])) {
            return $titles[$category][$index % count($titles[$category])];
        }
        
        return '記事タイトル' . rand(100, 999);
    }

    /**
     * ランダムな抜粋テキストを生成します
     */
    private function getRandomExcerpt(): string
    {
        $excerpts = [
            'この記事では、最新の研究結果と専門家の見解に基づいて詳細に解説します。あなたのライフスタイルに役立つ情報が満載です。',
            '多くの人が誤解している一般的な認識に対して、事実に基づいた新しい視点を提供します。この内容はあなたの考え方を変えるかもしれません。',
            '初心者から上級者まで、幅広い読者層に対応した実践的なガイドです。段階的に説明しているので、簡単に理解できます。',
            '長年の経験から導き出された独自の見解と、最新のデータに基づく分析結果を組み合わせた内容となっています。',
            'この分野のトップエキスパートへのインタビューと、最新の調査結果に基づく包括的な情報をお届けします。',
        ];
        
        return $excerpts[array_rand($excerpts)];
    }

    /**
     * ランダムな本文コンテンツを生成します
     */
    private function getRandomContent(): string
    {
        $paragraphs = [
            '<h2>はじめに</h2><p>この記事では、テーマについての基本的な理解から始め、徐々に高度なトピックへと進んでいきます。初心者の方でも理解しやすいように、専門用語には解説を加えています。</p>',
            '<h2>背景</h2><p>このテーマが注目されるようになった歴史的背景と、現在の状況について説明します。過去の重要なターニングポイントと、それが現在にどう影響しているかを理解することが重要です。</p>',
            '<h2>主要なポイント</h2><p>以下の3つの重要なポイントに焦点を当てて詳しく解説します。これらを理解することで、テーマ全体の約80%を把握することができます。</p><ul><li>ポイント1：基本原則と応用方法</li><li>ポイント2：一般的な誤解と真実</li><li>ポイント3：将来の展望と準備すべきこと</li></ul>',
            '<h2>実践的なアドバイス</h2><p>理論だけでなく実践も重要です。日常生活やビジネスでこの知識をどのように活用できるか、具体的な例を交えて説明します。すぐに行動に移せるヒントも含まれています。</p>',
            '<h2>専門家の見解</h2><p>この分野の著名な専門家たちの見解を紹介します。様々な視点から見ることで、より包括的な理解が得られるでしょう。</p><blockquote>「この分野は日々進化しており、常に最新情報をキャッチアップすることが重要です。」</blockquote>',
            '<h2>ケーススタディ</h2><p>実際の成功例と失敗例を分析することで、理論がどのように実践されるか、また何が効果的で何がそうでないかを理解できます。</p>',
            '<h2>よくある質問</h2><p>読者からよく寄せられる質問とその回答をまとめました。これらの質問は多くの人が抱える共通の疑問点を反映しています。</p>',
            '<h2>まとめ</h2><p>この記事で学んだ主要なポイントを振り返り、次のステップについて提案します。継続的な学習のためのリソースも紹介しています。</p>',
        ];
        
        // ランダムにパラグラフを選択し、結合
        shuffle($paragraphs);
        $selectedParagraphs = array_slice($paragraphs, 0, rand(4, count($paragraphs)));
        
        return implode("\n\n", $selectedParagraphs);
    }
}
