<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

/**
 * 認証コントローラーのテスト
 * 
 * ログイン、ログアウト、ユーザー情報取得の機能が正しく動作することを確認するテスト
 */
class AuthControllerTest extends TestCase
{
    use RefreshDatabase;

    /**
     * ユーザーログイン成功のテスト
     * 有効な認証情報でログインできることを確認する
     */
    #[Test]
    public function login_succeeds_with_valid_credentials(): void
    {
        // テスト用ユーザーを作成
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        // ログインリクエストを実行
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'password123'
        ]);

        // レスポンスの確認
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'おっけーだね'
            ]);

        // ユーザーが認証されていることを確認
        $this->assertAuthenticated();
    }

    /**
     * ユーザーログイン失敗のテスト
     * 不正な認証情報ではログインできないことを確認する
     */
    #[Test]
    public function login_fails_with_invalid_credentials(): void
    {
        // テスト用ユーザーを作成
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123')
        ]);

        // 誤ったパスワードでログインリクエストを実行
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrongpassword'
        ]);

        // レスポンスの確認
        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Login failed'
            ]);

        // ユーザーが認証されていないことを確認
        $this->assertGuest();
    }

    /**
     * バリデーションエラーのテスト
     * 必須フィールドが不足している場合にバリデーションエラーが返されることを確認する
     */
    #[Test]
    public function login_validation_rejects_missing_fields(): void
    {
        // 必須フィールドを欠いたリクエストを実行
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com'
            // passwordフィールドを意図的に省略
        ]);

        // バリデーションエラーが返されることを確認
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);

        // メールアドレスを省略した場合のテスト
        $response = $this->postJson('/api/login', [
            'password' => 'password123'
            // emailフィールドを意図的に省略
        ]);

        // バリデーションエラーが返されることを確認
        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * ユーザーログアウトのテスト
     * ログアウト処理が正しく機能することを確認する
     */
    #[Test]
    public function logout_works_correctly(): void
    {
        // テスト用ユーザーを作成
        $user = User::factory()->create();

        // ユーザーとして認証
        $this->actingAs($user);

        // 認証されていることを確認
        $this->assertAuthenticated();

        // ログアウトリクエストを実行
        $response = $this->postJson('/api/logout');

        // レスポンスの確認
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Logged out successfully'
            ]);

        // ユーザーがログアウトしていることを確認
        $this->assertGuest();
    }

    /**
     * ユーザー情報取得のテスト
     * 認証済みユーザーが自分の情報を取得できることを確認する
     */
    #[Test]
    public function user_can_get_their_information(): void
    {
        // テスト用ユーザーを作成
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // APIリクエスト用に認証設定
        $this->actingAs($user, 'sanctum');

        // ユーザー情報取得リクエストを実行
        $response = $this->getJson('/api/user');

        // レスポンスの確認
        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'name' => 'Test User',
                    'email' => 'test@example.com',
                ]
            ]);
    }

    /**
     * 未認証ユーザーの情報取得拒否のテスト
     * 認証されていないユーザーが情報取得エンドポイントにアクセスできないことを確認する
     */
    #[Test]
    public function unauthenticated_user_cannot_get_user_information(): void
    {
        // 未認証状態で情報取得を試みる
        $response = $this->getJson('/api/user');

        // 認証エラーが返されることを確認
        $response->assertStatus(401);
    }
}