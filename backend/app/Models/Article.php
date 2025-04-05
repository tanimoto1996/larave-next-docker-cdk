<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * 記事モデル
 * 
 * ブログ記事の情報を管理するモデルクラスです。
 * タイトル、内容、画像など記事に関する全ての情報を格納します。
 * 
 * @property int $id
 * @property int $category_id カテゴリーID
 * @property int $author_id 著者ID
 * @property string $title 記事タイトル
 * @property string $slug URLスラグ（一意）
 * @property string|null $image 画像パス
 * @property string $excerpt 抜粋
 * @property string $content 本文
 * @property int $likes_count いいね数
 * @property int $comments_count コメント数
 * @property bool $is_published 公開状態
 * @property \DateTime|null $published_at 公開日時
 * @property \DateTime $created_at 作成日時
 * @property \DateTime $updated_at 更新日時
 */
class Article extends Model
{
    use HasFactory;

    /**
     * 複数代入可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'category_id',
        'author_id',
        'title',
        'slug',
        'image',
        'excerpt',
        'content',
        'is_published',
        'published_at',
    ];

    /**
     * 型キャストする属性
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_published' => 'boolean',
        'published_at' => 'datetime',
        'likes_count' => 'integer',
        'comments_count' => 'integer',
    ];

    /**
     * この記事に関連するカテゴリーを取得
     *
     * @return BelongsTo
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    /**
     * この記事に関連する著者を取得
     *
     * @return BelongsTo
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * この記事に関連するコメントを取得
     *
     * @return HasMany
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * この記事に「いいね」したユーザーを取得
     *
     * @return BelongsToMany
     */
    public function likedBy(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'article_likes')
            ->withTimestamps();
    }

    /**
     * 公開済みの記事のみを取得するスコープ
     *
     * @param Builder $query
     * @return Builder
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->where('published_at', '<=', now());
    }

    /**
     * スラグから記事を検索するスコープ
     *
     * @param Builder $query
     * @param string $slug
     * @return Builder
     */
    public function scopeFindBySlug(Builder $query, string $slug): Builder
    {
        return $query->where('slug', $slug);
    }

    /**
     * 記事のアイキャッチ画像のURLを取得
     *
     * @return string
     */
    public function getImageUrlAttribute(): string
    {
        if ($this->image) {
            return asset('storage/' . $this->image);
        }
        
        return asset('images/default-article.jpg');
    }
}
