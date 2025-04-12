<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ユーザー情報取得リクエストのバリデーション
 * 
 * 認証済みユーザーのみがアクセス可能
 */
class GetUserRequest extends FormRequest
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
            // 特にパラメータは必要ないため、空の配列を返す
        ];
    }
}