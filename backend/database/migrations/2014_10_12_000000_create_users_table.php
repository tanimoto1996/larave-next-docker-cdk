<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * ユーザーテーブル作成マイグレーション
 * 
 * システムのユーザー情報を格納するテーブルを作成します。
 * ユーザー名、メールアドレス、パスワード等の基本情報を管理します。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * ユーザーテーブルを作成し、必要なカラムを定義します。
     */
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成したユーザーテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
