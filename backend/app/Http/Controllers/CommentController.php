<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Comment;
use App\Http\Requests\CommentStoreRequest;
use App\Http\Responses\ApiResponse;

/**
 * コメント管理コントローラー
 * 
 * 記事へのコメント投稿機能を提供します
 */
class CommentController extends Controller
{
    /**
     * 記事にコメントを投稿
     *
     * @param CommentStoreRequest $request
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(CommentStoreRequest $request, $slug)
    {
        $article = Article::published()->findBySlug($slug)->first();

        if (!$article) {
            return ApiResponse::error('記事が見つかりませんでした', null, 404);
        }

        // バリデーション済みのデータを使用
        $validatedData = $request->validated();

        $comment = new Comment();
        $comment->article_id = $article->id;
        $comment->content = $validatedData['content'];
        $comment->parent_id = $validatedData['parent_id'] ?? null;
        $comment->is_approved = false; // 承認待ち状態
        $comment->save();

        return ApiResponse::success($comment, 'コメントが投稿されました。承認後に表示されます。', 201);
    }
}
