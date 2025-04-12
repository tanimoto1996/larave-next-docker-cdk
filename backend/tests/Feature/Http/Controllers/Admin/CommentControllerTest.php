<?php

namespace Tests\Feature\Http\Controllers\Admin;

use App\Models\Article;
use App\Models\Comment;
use App\Models\User;
use App\Models\Category;
use App\Models\Author;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * 管理者向けコメントコントローラーのテスト
 * 
 * 管理者がコメントの一覧取得、承認・否認、削除などの操作を
 * 正しく実行できることを確認するテスト
 */
class CommentControllerTest extends TestCase
{
    use RefreshDatabase;

    private Article $article;
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
     * テスト実行前にカテゴリと著者、記事を作成する
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
            'author_id' => $this->author->id
        ]);
    }

    /**
     * 管理者がコメント一覧を取得できることをテスト
     * 管理者がすべてのコメント（承認済み・未承認）を取得できることを確認する
     */
    #[Test]
    public function admin_index_displays_all_comments(): void
    {
        $admin = $this->createAdmin();
        
        // 承認済みコメントを2つ作成
        Comment::factory()->count(2)->create([
            'article_id' => $this->article->id,
            'is_approved' => true
        ]);
        
        // 未承認コメントを1つ作成
        Comment::factory()->unapproved()->create([
            'article_id' => $this->article->id
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/comments');

        $response->assertStatus(200)
            ->assertJsonCount(3, 'data.data'); // ページネーションのため、dataの中のdataをカウント
    }

    /**
     * 承認状態でフィルタリングできることをテスト
     * 承認済み・未承認のコメントがそれぞれ正しくフィルタリングされることを確認する
     */
    #[Test]
    public function admin_index_filters_by_approval_status(): void
    {
        $admin = $this->createAdmin();
        
        // 承認済みコメントを2つ作成
        Comment::factory()->count(2)->create([
            'article_id' => $this->article->id,
            'is_approved' => true
        ]);
        
        // 未承認コメントを3つ作成
        Comment::factory()->count(3)->unapproved()->create([
            'article_id' => $this->article->id
        ]);

        // 承認済みコメントのみを取得
        $responseApproved = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/comments?approved=true');

        $responseApproved->assertStatus(200)
            ->assertJsonCount(2, 'data.data');

        // 未承認コメントのみを取得
        $responseUnapproved = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/comments?approved=false');

        $responseUnapproved->assertStatus(200)
            ->assertJsonCount(3, 'data.data');
    }

    /**
     * 記事IDでフィルタリングできることをテスト
     * 特定の記事に紐づくコメントのみが取得できることを確認する
     */
    #[Test]
    public function admin_index_filters_by_article_id(): void
    {
        $admin = $this->createAdmin();
        
        // 1つ目の記事のコメント
        Comment::factory()->count(2)->create([
            'article_id' => $this->article->id
        ]);
        
        // 2つ目の記事の作成
        $anotherArticle = Article::factory()->create([
            'category_id' => $this->category->id,
            'author_id' => $this->author->id
        ]);
        
        // 2つ目の記事のコメント
        Comment::factory()->count(3)->create([
            'article_id' => $anotherArticle->id
        ]);

        // 1つ目の記事のコメントのみを取得
        $response = $this->actingAs($admin, 'sanctum')
            ->getJson("/api/admin/comments?article_id={$this->article->id}");

        $response->assertStatus(200)
            ->assertJsonCount(2, 'data.data');
    }

    /**
     * コメント承認のテスト
     * 未承認のコメントを承認できることを確認する
     */
    #[Test]
    public function admin_approve_approves_comment(): void
    {
        $admin = $this->createAdmin();
        
        // 未承認コメントを作成
        $comment = Comment::factory()->unapproved()->create([
            'article_id' => $this->article->id
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/comments/{$comment->id}/approve", [
                'approved' => true
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $comment->id,
                    'is_approved' => true
                ]
            ]);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'is_approved' => true
        ]);
        
        // 記事のコメント数が更新されていることを確認
        $this->article->refresh();
        $this->assertEquals(1, $this->article->comments_count);
    }

    /**
     * コメント否認のテスト
     * 承認済みのコメントを否認できることを確認する
     */
    #[Test]
    public function admin_approve_unapproves_comment(): void
    {
        $admin = $this->createAdmin();
        
        // 承認済みコメントを作成
        $comment = Comment::factory()->create([
            'article_id' => $this->article->id,
            'is_approved' => true
        ]);
        
        // 記事のコメント数を更新
        $this->article->update(['comments_count' => 1]);

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/admin/comments/{$comment->id}/approve", [
                'approved' => false
            ]);

        $response->assertStatus(200)
            ->assertJson([
                'data' => [
                    'id' => $comment->id,
                    'is_approved' => false
                ]
            ]);

        $this->assertDatabaseHas('comments', [
            'id' => $comment->id,
            'is_approved' => false
        ]);
    }

    /**
     * コメント削除のテスト
     * コメントを削除できることを確認する
     */
    #[Test]
    public function admin_destroy_deletes_comment(): void
    {
        $admin = $this->createAdmin();
        
        // 承認済みコメントを作成
        $comment = Comment::factory()->create([
            'article_id' => $this->article->id,
            'is_approved' => true
        ]);
        
        // 記事のコメント数を更新
        $this->article->update(['comments_count' => 1]);

        $response = $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/admin/comments/{$comment->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('comments', ['id' => $comment->id]);
        
        // 記事のコメント数が更新されていることを確認
        $this->article->refresh();
        $this->assertEquals(0, $this->article->comments_count);
    }
    
    /**
     * コメント階層構造のテスト
     * 親コメントと返信コメントの関係が正しく取得できることを確認する
     */
    #[Test]
    public function admin_index_includes_parent_relationships(): void
    {
        $admin = $this->createAdmin();
        
        // 親コメントを作成
        $parentComment = Comment::factory()->create([
            'article_id' => $this->article->id
        ]);
        
        // 返信コメントを作成
        $replyComment = Comment::factory()->create([
            'article_id' => $this->article->id,
            'parent_id' => $parentComment->id
        ]);

        $response = $this->actingAs($admin, 'sanctum')
            ->getJson('/api/admin/comments');

        $response->assertStatus(200)
            ->assertJsonPath('data.data.1.parent_id', $parentComment->id);
    }
    
    /**
     * 一般ユーザーは管理者用APIにアクセスできないことをテスト
     */
    #[Test]
    public function regular_user_cannot_access_admin_comment_endpoints(): void
    {
        $user = $this->createUser();
        $comment = Comment::factory()->create([
            'article_id' => $this->article->id
        ]);

        // 一般ユーザーが管理者APIにアクセスするとエラーになる
        $response = $this->actingAs($user, 'sanctum')
            ->getJson("/api/admin/comments");
        
        $response->assertStatus(403); // Forbidden
    }

    /**
     * 未認証ユーザーは管理者用APIにアクセスできないことをテスト
     */
    #[Test]
    public function unauthenticated_user_cannot_access_admin_comment_endpoints(): void
    {
        $comment = Comment::factory()->create([
            'article_id' => $this->article->id
        ]);

        // 認証なしのアクセス
        $response = $this->getJson("/api/admin/comments");
        $response->assertStatus(401); // Unauthorized
        
        // 承認操作も拒否される
        $response = $this->putJson("/api/admin/comments/{$comment->id}/approve", [
            'approved' => true
        ]);
        $response->assertStatus(401); // Unauthorized
    }
}