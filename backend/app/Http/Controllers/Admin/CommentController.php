<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use Illuminate\Http\Request;
use App\Http\Responses\ApiResponse;

/**
 * 管理者向けコメント管理コントローラー
 * 
 * コメントの一覧表示、承認・否認、削除などの管理機能を提供します
 */
class CommentController extends Controller
{
    /**
     * コメント一覧を取得（管理者用）
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Comment::with(['article', 'parent'])
            ->orderBy('created_at', 'desc');

        // 承認状態でフィルタリング
        if ($request->has('approved')) {
            $query->where('is_approved', $request->approved == 'true');
        }

        // 記事IDでフィルタリング
        if ($request->has('article_id')) {
            $query->where('article_id', $request->article_id);
        }

        // ページネーション
        $perPage = $request->per_page ?? 20;
        $comments = $query->paginate($perPage);

        return ApiResponse::success($comments);
    }

    /**
     * コメントを承認または否認
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function approve(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->is_approved = $request->approved;
        $comment->save();

        // 承認された場合、記事のコメント数を更新
        if ($request->approved) {
            $article = $comment->article;
            $article->comments_count = $article->comments()->approved()->count();
            $article->save();
        }

        $message = $request->approved ? 'コメントが承認されました' : 'コメントが否認されました';
        return ApiResponse::success($comment, $message);
    }

    /**
     * コメントを削除
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $comment = Comment::findOrFail($id);
        $article = $comment->article;
        
        $comment->delete();
        
        // 記事のコメント数を更新
        $article->comments_count = $article->comments()->approved()->count();
        $article->save();

        return ApiResponse::success(null, 'コメントが削除されました');
    }
}
