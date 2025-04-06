<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ArticleStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     *
     * @return bool
     */
    public function authorize()
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules()
    {
        return [
            'title' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'author_id' => 'required|exists:authors,id',
            'excerpt' => 'required|string',
            'content' => 'required|string',
            'image' => 'nullable|image|max:2048',
            'is_published' => 'boolean',
            'published_at' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array
     */
    public function messages()
    {
        return [
            'title.required' => 'タイトルは必須です。',
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'category_id.required' => 'カテゴリーの選択は必須です。',
            'category_id.exists' => '選択されたカテゴリーは存在しません。',
            'author_id.required' => '著者の選択は必須です。',
            'author_id.exists' => '選択された著者は存在しません。',
            'excerpt.required' => '抜粋は必須です。',
            'content.required' => '本文は必須です。',
            'image.image' => '画像ファイルを選択してください。',
            'image.max' => '画像サイズは2MB以下にしてください。',
        ];
    }
}
