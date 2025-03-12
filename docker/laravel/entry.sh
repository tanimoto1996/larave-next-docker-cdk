#!/bin/sh

cd /var/www/html/backend

# 依存関係をインストール
composer install --no-dev --optimize-autoloader

# LaravelのAPP_KEYを設定
php artisan key:generate

# 必要なディレクトリの権限を修正
chown -R www-data:www-data /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache
chmod -R 775 /var/www/html/backend/storage /var/www/html/backend/bootstrap/cache

php artisan migrate --force
php artisan optimize
php artisan config:cache
php artisan route:cache

# 権限を変更
chmod -R 777 /var/www/html/backend/storage

php artisan serve --host=0.0.0.0 --port=8000