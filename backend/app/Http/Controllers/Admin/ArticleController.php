<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ArticleStoreRequest;
use App\Http\Requests\Admin\ArticleUpdateRequest;
use App\Models\Article;
use App\Models\Category;
use App\Models\Author;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use App\Http\Responses\ApiResponse;

/**
 * 管理者向け記事管理コントローラー
 * 
 * 記事の作成、編集、削除、一覧表示などの管理機能を提供します
 */
class ArticleController extends Controller
{
    /**
     * 記事の一覧を取得（管理者用）
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        // クエリビルダーを開始
        $query = Article::with(['category', 'author'])
            ->orderBy('created_at', 'desc');

        // 公開状態でフィルタリング
        if ($request->has('status')) {
            if ($request->status === 'published') {
                $query->where('is_published', true);
            } elseif ($request->status === 'draft') {
                $query->where('is_published', false);
            }
        }

        // カテゴリーでフィルタリング
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // 著者でフィルタリング
        if ($request->has('author')) {
            $query->where('author_id', $request->author);
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
        $perPage = $request->per_page ?? 15;
        $articles = $query->paginate($perPage);

        return ApiResponse::success($articles->items());
    }

    /**
     * 記事を新規作成
     *
     * @param ArticleStoreRequest $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(ArticleStoreRequest $request)
    {
        // バリデーション済みのデータを取得
        $validatedData = $request->validated();

        // スラグを生成
        $slug = Str::slug($validatedData['title']);
        $originalSlug = $slug;
        $count = 1;

        // スラグの一意性を確保
        while (Article::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-" . $count++;
        }

        $article = new Article($validatedData);
        $article->slug = $slug;
        
        // 公開日時の設定
        if ($validatedData['is_published'] ?? false) {
            $article->published_at = $validatedData['published_at'] ?? now();
        }

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('articles', 'public');
            $article->image = $path;
        }

        $article->save();

        return ApiResponse::success($article, '記事が作成されました', 201);
    }

    /**
     * 特定の記事を取得（管理者用）
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $article = Article::with(['category', 'author', 'comments.replies'])
            ->find($id);

        if (!$article) {
            return ApiResponse::error('記事が見つかりませんでした', 404);
        }

        return ApiResponse::success($article);
    }

    /**
     * 記事を更新
     *
     * @param ArticleUpdateRequest $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(ArticleUpdateRequest $request, $id)
    {
        $article = Article::find($id);

        if (!$article) {
            return ApiResponse::error('記事が見つかりませんでした', 404);
        }

        // バリデーション済みのデータを取得
        $validatedData = $request->validated();

        // タイトルが変更された場合はスラグを更新
        if (isset($validatedData['title']) && $validatedData['title'] !== $article->title) {
            $slug = Str::slug($validatedData['title']);
            $originalSlug = $slug;
            $count = 1;

            // スラグの一意性を確保
            while (Article::where('slug', $slug)->where('id', '!=', $article->id)->exists()) {
                $slug = "{$originalSlug}-" . $count++;
            }

            $article->slug = $slug;
        }

        // 公開状態の変更がある場合
        if (isset($validatedData['is_published'])) {
            if ($validatedData['is_published'] && !$article->is_published) {
                // 下書きから公開に変更
                $article->published_at = $validatedData['published_at'] ?? now();
            } elseif (!$validatedData['is_published'] && $article->is_published) {
                // 公開から下書きに変更
                $article->published_at = null;
            }
        }

        // 画像のアップロード処理
        if ($request->hasFile('image')) {
            // 古い画像を削除
            if ($article->image) {
                Storage::disk('public')->delete($article->image);
            }
            
            $path = $request->file('image')->store('articles', 'public');
            $article->image = $path;
        }

        $article->fill($validatedData);
        $article->save();

        return ApiResponse::success($article, '記事が更新されました');
    }

    /**
     * 記事を削除
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $article = Article::find($id);

        if (!$article) {
            return ApiResponse::error('記事が見つかりませんでした', 404);
        }

        // 画像がある場合は削除
        if ($article->image) {
            Storage::disk('public')->delete($article->image);
        }

        $article->delete();

        return response()->noContent();
    }

    /**
     * カテゴリと著者の一覧を取得（記事作成/編集フォーム用）
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getFormData()
    {
        $categories = Category::all();
        $authors = Author::all();
        
        return ApiResponse::success([
            'categories' => $categories,
            'authors' => $authors,
        ]);
    }
}
