<?php

namespace App\Http\Controllers;

use App\Models\Article;
use App\Models\Category;
use App\Http\Requests\Article\IndexRequest;
use App\Http\Responses\ApiResponse;

/**
 * 一般公開向け記事コントローラー
 * 
 * 公開済み記事の表示や検索機能を提供します
 */
class ArticleController extends Controller
{
    /**
     * 公開済み記事の一覧を取得
     *
     * @param \App\Http\Requests\Article\IndexRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(IndexRequest $request)
    {
        // クエリビルダーを開始
        $query = Article::with(['category', 'author'])
            ->published()
            ->orderBy('published_at', 'desc');

        // カテゴリーでフィルタリング
        if ($request->has('category')) {
            $category = Category::where('slug', $request->category)->first();
            if ($category) {
                $query->where('category_id', $category->id);
            }
        }

        // 検索キーワードでフィルタリング
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%");
            });
        }

        // ページネーション
        $perPage = $request->per_page ?? 10;
        $articles = $query->paginate($perPage);

        return ApiResponse::success($articles->items());
    }

    /**
     * 特定の公開済み記事を取得
     *
     * @param string $slug
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($slug)
    {
        $article = Article::with(['category', 'author', 'comments' => function($query) {
                $query->approved()->root()->with(['replies' => function($q) {
                    $q->approved();
                }]);
            }])
            ->published()
            ->where('slug', $slug)
            ->first();

        if (!$article) {
            return response()->json([
                'success' => false,
                'message' => '記事が見つかりませんでした',
            ], 404);
        }

        return response()->json([
            'data' => $article,
        ]);
    }

    /**
     * カテゴリー一覧を取得
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function categories()
    {
        $categories = Category::all();
        
        return response()->json([
            'success' => true,
            'data' => $categories,
        ]);
    }
}
