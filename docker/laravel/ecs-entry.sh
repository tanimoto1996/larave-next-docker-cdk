#!/bin/sh

cd /var/www/html

# キャッシュをクリア
php artisan config:clear
php artisan route:clear
php artisan view:clear

# マイグレーションを実行（--forceでプロンプトを回避）
php artisan migrate --force

# キャッシュを生成
php artisan config:cache
php artisan route:cache
php artisan view:cache

# ヘルスチェックエンドポイントの作成
if [ ! -f "routes/api.php.original" ]; then
  cp routes/api.php routes/api.php.original
  echo "
// ヘルスチェックエンドポイント
Route::get('/health', function () {
    return response()->json(['status' => 'ok'], 200);
});" >> routes/api.php
fi

# php-fpmではなくartisan serveを使用
# ECSの場合は最適な設定でサーバーを起動
php artisan serve --host=0.0.0.0 --port=8000