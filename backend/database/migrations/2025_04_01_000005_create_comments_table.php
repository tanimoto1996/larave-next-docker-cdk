<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * コメントテーブル作成マイグレーション
 * 
 * 記事に対するユーザーコメントを管理するテーブルを作成します。
 * 階層型（親コメントと返信）のコメント構造をサポートします。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * コメントテーブルを作成し、必要なカラムを定義します。
     * コメント内容、承認状態などを管理し、記事テーブルの外部キー関連付けを行います。
     * 親コメントへの参照も定義し、階層構造を実現します。
     */
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('article_id')->constrained()->onDelete('cascade');
            $table->foreignId('parent_id')->nullable()->constrained('comments')->onDelete('cascade');
            $table->text('content');
            $table->boolean('is_approved')->default(false);
            $table->timestamps();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成したコメントテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
