<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * セッションテーブル作成マイグレーション
 * 
 * データベースセッションドライバーで使用するセッション情報を格納するテーブルを作成します。
 * ユーザーのセッション状態を永続化し、複数サーバー環境でのセッション共有を可能にします。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * セッションテーブルを作成し、必要なカラムを定義します。
     * セッションID、ユーザーID、IPアドレス、ペイロード、最終アクティビティなどを管理します。
     */
    public function up(): void
    {
        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成したセッションテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('sessions');
    }
};
