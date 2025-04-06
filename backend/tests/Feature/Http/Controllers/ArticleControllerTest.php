<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Article;
use App\Models\User;
use App\Models\Author;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\Attributes\BeforeClass;

class ArticleControllerTest extends TestCase
{
    use RefreshDatabase;

    private Category $category;
    private Author $author;

    /**
     * 管理者ユーザーを作成するヘルパーメソッド
     *
     * @return User 管理者権限を持つユーザーオブジェクト
     */
    private function createAdmin(): User
    {
        // User::isAdmin()で管理者と判定されるメールアドレスのユーザーを作成
        return User::factory()->create([
            'email' => 'yumenikki2@gmail.com'
        ]);
    }

    /**
     * 一般ユーザーを作成するヘルパーメソッド
     *
     * @return User 一般ユーザーオブジェクト
     */
    private function createUser(): User
    {
        return User::factory()->create([
            'email' => 'regular-user@example.com'
        ]);
    }

    /**
     * 初期セットアップ
     * テスト実行前にカテゴリと著者を作成する
     * 
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $this->category = Category::factory()->create();
        $this->author = Author::factory()->create();
    }

    /**
     * 記事一覧の取得をテスト
     * 公開済みの記事のみが取得できることを確認する
     */
    #[Test]
    public function index_displays_published_articles_for_public(): void
    {
        // 公開済み記事を3つ作成
        Article::factory()->count(3)->create([
            'is_published' => true,
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);
        // 非公開記事を1つ作成
        Article::factory()->unpublished()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        // 未認証ユーザーとして公開APIにアクセス
        $response = $this->getJson('/api/articles');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data'); // 公開済み記事のみ取得できる
    }

    /**
     * 記事詳細の取得をテスト
     * 公開APIによる単一記事取得でスラグを使って記事が取得できることを確認する
     */
    #[Test]
    public function show_displays_published_article_by_slug(): void
    {
        $article = Article::factory()->create([
            'slug' => 'test-article',
            'is_published' => true,
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        // スラグによる記事取得
        $response = $this->getJson("/api/articles/{$article->slug}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'content' => $article->content,
                    'slug' => 'test-article'
                ]
            ]);
    }

    /**
     * 管理者の記事一覧取得をテスト
     * 管理者は公開/非公開を問わず全ての記事を取得できることを確認する
     */
    #[Test]
    public function admin_index_displays_all_articles(): void
    {
        $admin = $this->createAdmin();
        
        // 公開/非公開記事を作成
        Article::factory()->count(2)->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);
        Article::factory()->unpublished()->count(1)->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/articles');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data'); // 全ての記事が取得できる
    }

    /**
     * 管理者の記事詳細取得をテスト
     * 管理者が特定の記事の詳細情報を取得できることを確認する
     */
    #[Test]
    public function admin_show_displays_article_details(): void
    {
        $admin = $this->createAdmin();
        $article = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/admin/articles/{$article->id}");

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $article->id,
                    'title' => $article->title,
                    'content' => $article->content,
                ]
            ]);
    }

    /**
     * 管理者による記事作成をテスト
     * 管理者が新しい記事を作成でき、データベースに保存されることを確認する
     */
    #[Test]
    public function admin_store_creates_new_article(): void
    {
        $admin = $this->createAdmin();

        $articleData = [
            'title' => 'テスト記事タイトル',
            'content' => 'これはテスト記事の内容です。',
            'slug' => 'test-article',
            'excerpt' => 'テスト記事の抜粋',
            'category_id' => $this->category->id,
            'author_id' => $this->author->id,
            'is_published' => true
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->postJson('/api/admin/articles', $articleData);

        $response->assertStatus(201)
            ->assertJson([
                'data' => [
                    'title' => $articleData['title'],
                    'content' => $articleData['content'],
                ]
            ]);

        $this->assertDatabaseHas('articles', [
            'title' => $articleData['title'],
            'content' => $articleData['content'],
        ]);
    }

    /**
     * 管理者による記事更新をテスト
     * 管理者が既存の記事を更新でき、変更が反映されることを確認する
     */
    #[Test]
    public function admin_update_modifies_article(): void
    {
        $admin = $this->createAdmin();
        $article = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        $updatedData = [
            'title' => '更新されたタイトル',
            'content' => '更新された内容',
            'slug' => 'updated-article',
        ];

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/articles/{$article->id}", $updatedData);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $article->id,
                    'title' => $updatedData['title'],
                    'content' => $updatedData['content'],
                ]
            ]);

        $this->assertDatabaseHas('articles', [
            'id' => $article->id,
            'title' => $updatedData['title'],
            'content' => $updatedData['content'],
        ]);
    }

    /**
     * 管理者による記事削除をテスト
     * 管理者が記事を削除でき、データベースから記事が削除されることを確認する
     */
    #[Test]
    public function admin_destroy_deletes_article(): void
    {
        $admin = $this->createAdmin();
        $article = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/articles/{$article->id}");

        $response->assertStatus(204);
        $this->assertDatabaseMissing('articles', ['id' => $article->id]);
    }

    /**
     * 一般ユーザーは管理者用APIにアクセスできないことをテスト
     * 一般ユーザーが管理者向けエンドポイントにアクセスすると403エラーが返されることを確認する
     */
    #[Test]
    public function regular_user_cannot_access_admin_endpoints(): void
    {
        $user = $this->createUser();
        $article = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        // 一般ユーザーが管理者APIにアクセスするとエラーになる
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/admin/articles");
        
        $response->assertStatus(403); // Forbidden
    }

    /**
     * 未認証ユーザーは管理者用APIにアクセスできないことをテスト
     * 認証されていないユーザーが管理者向けエンドポイントにアクセスすると401エラーが返されることを確認する
     */
    #[Test]
    public function unauthenticated_user_cannot_access_admin_endpoints(): void
    {
        $article = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);

        // 認証なしのアクセス
        $response = $this->getJson("/api/admin/articles/{$article->id}");
        $response->assertStatus(401); // Unauthorized
        
        // 作成リクエストも拒否される
        $response = $this->postJson('/api/admin/articles', [
            'title' => 'テストタイトル',
            'content' => 'テスト内容'
        ]);
        $response->assertStatus(401); // Unauthorized
    }
}
