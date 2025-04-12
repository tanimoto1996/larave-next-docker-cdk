<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Responses\ApiResponse;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\LogoutRequest;
use App\Http\Requests\Auth\GetUserRequest;

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
     * @param LoginRequest $request バリデーション済みのログイン情報を含むリクエスト
     * @return \Illuminate\Http\JsonResponse ログイン結果のレスポンス
     */
    public function login(LoginRequest $request)
    {
        $credentials = $request->only('email', 'password');

        if (Auth::attempt($credentials)) {
            // セッション再生成
            $request->session()->regenerate();
            return ApiResponse::success(null, 'おっけーだね');
        }
        return ApiResponse::error('Login failed', null, 401);
    }

    /**
     * ユーザーログアウト処理
     *
     * @param LogoutRequest $request バリデーション済みのリクエスト
     * @return \Illuminate\Http\JsonResponse ログアウト結果のレスポンス
     */
    public function logout(LogoutRequest $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return ApiResponse::success(null, 'Logged out successfully');
    }

    /**
     * 現在認証されているユーザー情報を取得
     *
     * @param GetUserRequest $request バリデーション済みのリクエスト
     * @return \Illuminate\Http\JsonResponse ユーザー情報のレスポンス
     */
    public function user(GetUserRequest $request)
    {
        return ApiResponse::success($request->user()); // Auth::user() と同義
    }
}
