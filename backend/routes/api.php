<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ArticleController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\Admin\ArticleController as AdminArticleController;
use App\Http\Controllers\Admin\CommentController as AdminCommentController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::post('/login', [AuthController::class, 'login'])->name('login');
Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

// 公開APIルート（認証不要）
Route::get('/articles', [ArticleController::class, 'index']);
Route::get('/articles/{slug}', [ArticleController::class, 'show']);
Route::get('/categories', [ArticleController::class, 'categories']);
Route::post('/articles/{slug}/comments', [CommentController::class, 'store']);

Route::middleware('auth')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    
    // 管理者用ルート
    Route::prefix('admin')->middleware('admin')->group(function () {
        // 記事管理
        Route::get('/articles/form-data', [AdminArticleController::class, 'getFormData']);
        Route::apiResource('/articles', AdminArticleController::class);
        
        // コメント管理
        Route::get('/comments', [AdminCommentController::class, 'index']);
        Route::put('/comments/{id}/approve', [AdminCommentController::class, 'approve']);
        Route::delete('/comments/{id}', [AdminCommentController::class, 'destroy']);
    });
});
