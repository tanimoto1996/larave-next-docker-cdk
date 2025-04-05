<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * パスワードリセットトークンテーブル作成マイグレーション
 * 
 * ユーザーがパスワードをリセットする際に使用するトークンを管理するテーブルを作成します。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * パスワードリセットトークンテーブルを作成し、トークン管理に必要なカラムを定義します。
     */
    public function up(): void
    {
        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成したパスワードリセットトークンテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('password_reset_tokens');
    }
};
