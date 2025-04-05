<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 記事テーブル作成マイグレーション
 * 
 * ブログ記事の主要情報を管理するテーブルを作成します。
 * タイトル、内容、画像など記事に関するすべての情報を格納します。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * 記事テーブルを作成し、必要なカラムを定義します。
     * 記事のタイトル、スラグ、内容、抜粋、画像パス、公開状態などを管理し、
     * カテゴリーテーブルと著者テーブルとの外部キー関連付けを行います。
     * また、いいね数やコメント数のカウンターも保持します。
     */
    public function up(): void
    {
        Schema::create('articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained()->onDelete('cascade');
            $table->foreignId('author_id')->constrained()->onDelete('cascade');
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('image')->nullable();
            $table->text('excerpt');
            $table->longText('content');
            $table->integer('likes_count')->default(0);
            $table->integer('comments_count')->default(0);
            $table->boolean('is_published')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成した記事テーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('articles');
    }
};
