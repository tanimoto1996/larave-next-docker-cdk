<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 著者テーブル作成マイグレーション
 * 
 * 記事を執筆する著者の情報を管理するテーブルを作成します。
 * ユーザーテーブルと関連付けることで、ログインユーザーが記事を投稿できるようにします。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * 著者テーブルを作成し、必要なカラムを定義します。
     * 著者名、自己紹介文、プロフィール画像などを管理し、
     * ユーザーテーブルとの外部キー関連付けを行います。
     */
    public function up(): void
    {
        Schema::create('authors', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null');
            $table->string('name');
            $table->text('bio')->nullable();
            $table->string('profile_image')->nullable();
            $table->timestamps();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成した著者テーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('authors');
    }
};
