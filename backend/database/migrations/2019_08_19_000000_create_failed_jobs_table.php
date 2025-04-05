<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * 失敗したジョブテーブル作成マイグレーション
 * 
 * キューに入れられたジョブの処理が失敗した際の情報を保存するテーブルを作成します。
 * 失敗したジョブの詳細とエラー情報を記録し、後で分析や再試行ができるようにします。
 */
return new class extends Migration
{
    /**
     * マイグレーション実行
     * 
     * 失敗したジョブテーブルを作成し、必要なカラムを定義します。
     * 接続情報、キュー名、ペイロード、例外情報などを保存します。
     */
    public function up(): void
    {
        Schema::create('failed_jobs', function (Blueprint $table) {
            $table->id();
            $table->string('uuid')->unique();
            $table->text('connection');
            $table->text('queue');
            $table->longText('payload');
            $table->longText('exception');
            $table->timestamp('failed_at')->useCurrent();
        });
    }

    /**
     * マイグレーションの巻き戻し
     * 
     * 作成した失敗したジョブテーブルを削除します。
     */
    public function down(): void
    {
        Schema::dropIfExists('failed_jobs');
    }
};
