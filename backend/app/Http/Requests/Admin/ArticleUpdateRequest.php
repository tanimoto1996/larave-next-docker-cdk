<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class ArticleUpdateRequest extends FormRequest
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
            'title' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'author_id' => 'sometimes|exists:authors,id',
            'excerpt' => 'sometimes|string',
            'content' => 'sometimes|string',
            'image' => 'nullable|image|max:2048',
            'is_published' => 'sometimes|boolean',
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
            'title.max' => 'タイトルは255文字以内で入力してください。',
            'category_id.exists' => '選択されたカテゴリーは存在しません。',
            'author_id.exists' => '選択された著者は存在しません。',
            'image.image' => '画像ファイルを選択してください。',
            'image.max' => '画像サイズは2MB以下にしてください。',
        ];
    }
}
