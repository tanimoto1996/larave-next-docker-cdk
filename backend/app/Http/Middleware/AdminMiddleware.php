<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AdminMiddleware
{
    /**
     * 管理者権限を持つユーザーのみアクセスを許可するミドルウェア
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (!Auth::check()) {
            return response()->json([
                'success' => false,
                'message' => '認証が必要です',
            ], 401);
        }

        /** @var User $user */
        $user = Auth::user();
        if (!$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => '管理者権限が必要です',
            ], 403);
        }

        return $next($request);
    }
}
