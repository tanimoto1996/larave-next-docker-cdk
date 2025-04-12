<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ログアウトリクエストのバリデーション
 * 
 * ログアウト処理のリクエストを検証する
 */
class LogoutRequest extends FormRequest
{
    /**
     * リクエストの認可を判断する
     * 認証済みユーザーのみアクセス可能
     *
     * @return bool
     */
    public function authorize()
    {
        return $this->user() !== null;
    }

    /**
     * バリデーションルールを取得
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules()
    {
        return [
            // ログアウトには特別なパラメータは必要ない
        ];
    }
}