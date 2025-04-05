<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * カテゴリーテーブル作成マイグレーション
 * 
 * 記事のカテゴリー情報を管理するテーブルを作成します。
 * テクノロジー、旅行、健康などの記事分類に使用します。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * マスターテーブルです。
     * カテゴリーテーブルを作成し、必要なカラムを定義します。
     * カテゴリー名、スラグ（URL用の文字列）、説明文などを管理します。
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成したカテゴリーテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
