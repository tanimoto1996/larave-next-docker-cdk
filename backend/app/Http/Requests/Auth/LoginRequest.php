<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * ログインリクエストのバリデーション
 * 
 * ログイン処理に必要なパラメータのバリデーションを担当する
 */
class LoginRequest extends FormRequest
{
    /**
     * リクエストの認可を判断する
     *
     * @return bool
     */
    public function authorize()
    {
        return true; // 誰でもログインフォームにアクセス可能
    }

    /**
     * バリデーションルールを取得
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules()
    {
        return [
            'email' => ['required', 'email'],
            'password' => ['required'],
        ];
    }

    /**
     * バリデーション失敗時のエラーメッセージ
     *
     * @return array<string, string>
     */
    public function messages()
    {
        return [
            'email.required' => 'メールアドレスを入力してください。',
            'email.email' => '有効なメールアドレス形式で入力してください。',
            'password.required' => 'パスワードを入力してください。',
        ];
    }
}