<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 記事いいねテーブル作成マイグレーション
 * 
 * ユーザーが記事に「いいね」を付けた情報を管理する中間テーブルを作成します。
 * どのユーザーがどの記事にいいねしたかを記録します。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * 記事いいねテーブルを作成し、必要なカラムを定義します。
     * ユーザーIDと記事IDの組み合わせを管理し、重複していいねができないように制約を設けます。
     * また、いつ「いいね」されたかの情報も記録します。
     */
    public function up(): void
    {
        Schema::create('article_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->timestamps();
            
            // 同じユーザーが同じ記事に複数回いいねできないようにする
            $table->unique(['user_id', 'article_id']);
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成した記事いいねテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('article_likes');
    }
};
