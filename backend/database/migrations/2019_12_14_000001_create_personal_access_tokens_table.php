<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * パーソナルアクセストークンテーブル作成マイグレーション
 * 
 * API認証に使用するパーソナルアクセストークンを管理するテーブルを作成します。
 * Sanctumパッケージを使用したトークンベースの認証システムの基盤となります。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * パーソナルアクセストークンテーブルを作成し、必要なカラムを定義します。
     * トークン名、ハッシュ化されたトークン値、許可された機能、有効期限などを管理します。
     */
    public function up(): void
    {
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成したパーソナルアクセストークンテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_access_tokens');
    }
};
