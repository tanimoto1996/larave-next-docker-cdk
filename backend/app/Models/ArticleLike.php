<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 記事いいねモデル
 * 
 * ユーザーが記事に「いいね」を付けた情報を管理する中間テーブルのモデルクラスです。
 * どのユーザーがどの記事にいいねしたかを記録します。
 * 
 * @property int $id
 * @property int $user_id ユーザーID
 * @property int $article_id 記事ID
 * @property \DateTime $created_at 作成日時
 * @property \DateTime $updated_at 更新日時
 */
class ArticleLike extends Model
{
    use HasFactory;

    /**
     * モデルに関連付けるテーブル
     *
     * @var string
     */
    protected $table = 'article_likes';

    /**
     * 複数代入可能な属性
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'article_id',
    ];

    /**
     * このいいねに関連するユーザーを取得
     *
     * @return BelongsTo
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * このいいねに関連する記事を取得
     *
     * @return BelongsTo
     */
    public function article(): BelongsTo
    {
        return $this->belongsTo(Article::class);
    }
}
