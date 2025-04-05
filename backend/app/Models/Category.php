<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * カテゴリーモデル
 * 
 * 記事のカテゴリー情報を管理するモデルクラスです。
 * テクノロジー、旅行、健康など記事の分類に使用されます。
 * 
 * @property int $id
 * @property string $name カテゴリー名
 * @property string $slug URLスラグ（一意）
 * @property string|null $description カテゴリー説明
 * @property \DateTime $created_at 作成日時
 * @property \DateTime $updated_at 更新日時
 */
class Category extends Model
{
    use HasFactory;

    /**
     * 複数代入可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    /**
     * このカテゴリーに属する記事を取得
     *
     * @return HasMany
     */
    public function articles(): HasMany
    {
        return $this->hasMany(Article::class);
    }

    /**
     * スラグからカテゴリーを検索するスコープ
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string $slug
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeFindBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }
}
