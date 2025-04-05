<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 著者モデル
 * 
 * 記事を執筆する著者の情報を管理するモデルクラスです。
 * ユーザーテーブルと関連付けられ、執筆者としての追加情報を管理します。
 * 
 * @property int $id
 * @property int|null $user_id 関連ユーザーID
 * @property string $name 著者名
 * @property string|null $bio 自己紹介文
 * @property string|null $profile_image プロフィール画像パス
 * @property \DateTime $created_at 作成日時
 * @property \DateTime $updated_at 更新日時
 */
class Author extends Model
{
    use HasFactory;

    /**
     * 複数代入可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'bio',
        'profile_image',
    ];

    /**
     * この著者に関連するユーザーを取得
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * この著者が書いた記事を取得
     *
     * @return HasMany
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class, 'author_id');
    }

    /**
     * 著者のプロフィール画像のURLを取得
     *
     * @return string
     */
    public function getProfileImageUrlAttribute(): string
    {
        if ($this->profile_image) {
            return asset('storage/' . $this->profile_image);
        }
        
        return asset('images/default-profile.png');
    }
}
