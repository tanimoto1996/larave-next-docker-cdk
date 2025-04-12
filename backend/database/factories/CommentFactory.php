<?php

namespace Database\Factories;

use App\Models\Article;
use App\Models\Comment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Comment>
 */
class CommentFactory extends Factory
{
    /**
     * ファクトリーに対応するモデル名
     *
     * @var string
     */
    protected $model = Comment::class;

    /**
     * モデルのデフォルト状態の定義
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'article_id' => Article::factory(),
            'parent_id' => null,
            'content' => $this->faker->paragraph(),
            'is_approved' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * 未承認のコメントを作成
     */
    public function unapproved(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_approved' => false,
        ]);
    }

    /**
     * 返信コメント（親コメントを持つ）を作成
     */
    public function asReply(): static
    {
        return $this->state(function (array $attributes) {
            return [
                'parent_id' => Comment::factory()->create()->id,
            ];
        });
    }
}