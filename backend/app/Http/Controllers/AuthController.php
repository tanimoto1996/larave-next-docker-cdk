<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Responses\ApiResponse;

/**
 * 認証コントローラー
 * 
 * ログイン、ログアウト、ユーザー情報取得などの認証機能を提供します
 */
class AuthController extends Controller
{
    /**
     * ユーザーログイン処理
     *
     * @param Request $request ログイン情報を含むリクエスト
     * @return \Illuminate\Http\JsonResponse ログイン結果のレスポンス
     */
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required','email'],
            'password' => ['required']
        ]);

        if (Auth::attempt($credentials)) {
            // セッション再生成
            $request->session()->regenerate();
            return ApiResponse::success(null, 'おっけーだね');
        }
        return ApiResponse::error('Login failed', 401);
    }

    /**
     * ユーザーログアウト処理
     *
     * @param Request $request リクエスト
     * @return \Illuminate\Http\JsonResponse ログアウト結果のレスポンス
     */
    public function logout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return ApiResponse::success(null, 'Logged out successfully');
    }

    /**
     * 現在認証されているユーザー情報を取得
     *
     * @param Request $request リクエスト
     * @return \Illuminate\Http\JsonResponse ユーザー情報のレスポンス
     */
    public function user(Request $request)
    {
        return ApiResponse::success($request->user()); // Auth::user() と同義
    }
}
