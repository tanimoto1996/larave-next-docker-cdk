<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Models\Author;
use App\Models\Comment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * コメントコントローラーのテスト
 * 
 * 記事へのコメント投稿機能が正しく動作することを確認するテスト
 */
class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    private Article $article;
    private Category $category;
    private Author $author;

    /**
     * 初期セットアップ
     * テスト実行前にカテゴリ、著者、公開済み記事を作成する
     * 
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->category = Category::factory()->create();
        $this->author = Author::factory()->create();
        $this->article = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id,
            'is_published' => true,
            'published_at' => now()->subDay(),
        ]);
    }

    /**
     * 記事にコメントを投稿できることをテスト
     * 正しい入力データでコメントを投稿すると、未承認状態でデータベースに保存されることを確認する
     */
    #[Test]
    public function store_creates_unapproved_comment(): void
    {
        $commentData = [
            'content' => 'これはテスト用のコメントです。',
        ];

        $response = $this->postJson(
            "/api/articles/{$this->article->slug}/comments", 
            $commentData
        );

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'コメントが投稿されました。承認後に表示されます。',
                'data' => [
                    'content' => 'これはテスト用のコメントです。',
                    'is_approved' => false,
                    'article_id' => $this->article->id,
                ]
            ]);

        $this->assertDatabaseHas('comments', [
            'content' => 'これはテスト用のコメントです。',
            'is_approved' => false,
            'article_id' => $this->article->id,
            'parent_id' => null,
        ]);
    }

    /**
     * 親コメントへの返信を投稿できることをテスト
     * 親コメントIDを指定して返信を投稿すると、正しい親子関係が保存されることを確認する
     */
    #[Test]
    public function store_creates_reply_to_parent_comment(): void
    {
        // 親コメントを作成
        $parentComment = Comment::factory()->create([
            'article_id' => $this->article->id,
            'is_approved' => true,
        ]);

        $replyData = [
            'content' => 'これは返信コメントです。',
            'parent_id' => $parentComment->id,
        ];

        $response = $this->postJson(
            "/api/articles/{$this->article->slug}/comments", 
            $replyData
        );

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'content' => 'これは返信コメントです。',
                    'parent_id' => $parentComment->id,
                ]
            ]);

        $this->assertDatabaseHas('comments', [
            'content' => 'これは返信コメントです。',
            'parent_id' => $parentComment->id,
            'article_id' => $this->article->id,
        ]);
    }

    /**
     * 不正なデータでコメント投稿するとバリデーションエラーになることをテスト
     * 空のコンテンツでコメントを投稿すると、バリデーションエラーが返されることを確認する
     */
    #[Test]
    public function store_validates_required_fields(): void
    {
        $response = $this->postJson(
            "/api/articles/{$this->article->slug}/comments", 
            ['content' => '']
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    /**
     * 存在しない記事へのコメント投稿が失敗することをテスト
     * 存在しない記事スラッグに対してコメントを投稿すると、404エラーが返されることを確認する
     */
    #[Test]
    public function store_returns_404_for_nonexistent_article(): void
    {
        $commentData = [
            'content' => 'これはテスト用のコメントです。',
        ];

        $response = $this->postJson(
            "/api/articles/non-existent-slug/comments", 
            $commentData
        );

        $response->assertStatus(404)
            ->assertJson([
                'message' => '記事が見つかりませんでした'
            ]);
    }

    /**
     * 非公開記事へのコメント投稿が失敗することをテスト
     * 非公開記事に対してコメントを投稿すると、404エラーが返されることを確認する
     */
    #[Test]
    public function store_returns_404_for_unpublished_article(): void
    {
        // 非公開記事を作成
        $unpublishedArticle = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id,
            'is_published' => false,
        ]);

        $commentData = [
            'content' => 'これはテスト用のコメントです。',
        ];

        $response = $this->postJson(
            "/api/articles/{$unpublishedArticle->slug}/comments", 
            $commentData
        );

        $response->assertStatus(404)
            ->assertJson([
                'message' => '記事が見つかりませんでした'
            ]);
    }

    /**
     * コメント本文が最大文字数を超えるとバリデーションエラーになることをテスト
     * 長すぎるコメントを投稿すると、バリデーションエラーが返されることを確認する
     */
    #[Test]
    public function store_validates_content_length(): void
    {
        // 1000文字を超えるコメントを作成
        $longComment = str_repeat('あ', 1001);
        
        $response = $this->postJson(
            "/api/articles/{$this->article->slug}/comments", 
            ['content' => $longComment]
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['content']);
    }

    /**
     * 存在しない親コメントへの返信が失敗することをテスト
     * 存在しない親コメントIDを指定すると、バリデーションエラーが返されることを確認する
     */
    #[Test]
    public function store_validates_parent_comment_existence(): void
    {
        $nonExistentParentId = 9999;
        
        $replyData = [
            'content' => 'これは返信コメントです。',
            'parent_id' => $nonExistentParentId,
        ];

        $response = $this->postJson(
            "/api/articles/{$this->article->slug}/comments", 
            $replyData
        );

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['parent_id']);
    }
}