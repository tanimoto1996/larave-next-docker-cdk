<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * ユーザーモデル
 * 
 * システムの認証ユーザー情報を管理するモデルクラスです。
 * 認証機能、通知機能、APIトークン機能を実装しています。
 * 
 * @property int $id
 * @property string $name ユーザー名
 * @property string $email メールアドレス
 * @property \DateTime|null $email_verified_at メール確認日時
 * @property string $password パスワード（ハッシュ済み）
 * @property string|null $remember_token ログイン状態維持トークン
 * @property \DateTime $created_at 作成日時
 * @property \DateTime $updated_at 更新日時
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * 複数代入可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * 非表示にする属性
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * 型キャストする属性
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * このユーザーに関連する著者情報を取得
     *
     * @return HasOne
     */
    public function author(): HasOne
    {
        return $this->hasOne(Author::class);
    }

    /**
     * このユーザーが「いいね」した記事を取得
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function likedArticles()
    {
        return $this->belongsToMany(Article::class, 'article_likes')
            ->withTimestamps();
    }
    
    /**
     * ユーザーが管理者かどうかを判定
     * 
     * @return bool
     */
    public function isAdmin(): bool
    {
        // 実際のプロジェクトでは、DBにrole/is_admin列を追加するか
        // 別のロールテーブルを用意するのが望ましい
        // 現状では特定のメールアドレスを管理者として扱う
        return in_array($this->email, [
            'yumenikki2@gmail.com',
            'k-tanimoto@mamiya-its.co.jp'
        ]);
    }
}
