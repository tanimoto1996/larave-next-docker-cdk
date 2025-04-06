FROM php:8.4-fpm

# ユーザーとグループのIDを指定
ARG UID=1000
ARG GID=1000

WORKDIR /var/www/html

# PHP拡張機能のインストール
RUN apt-get update && apt-get install -y --no-install-recommends \
    openssh-client \
    libpng-dev \
    libjpeg62-turbo-dev \
    libfreetype6-dev \
    zip \
    libzip-dev \
    build-essential \
    locales \
    unzip \
    git \
    curl \
    libpq-dev \
    libicu-dev \
    openssl \
    libssl-dev \
    && docker-php-ext-configure pgsql -with-pgsql=/usr/local/pgsql \
    && docker-php-ext-install pdo pdo_pgsql pgsql \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# www-data ユーザーのUIDとGIDを変更
RUN usermod -u $UID www-data && groupmod -g $GID www-data

COPY docker/laravel/php.ini /usr/local/etc/php/php.ini

# Composerのインストール
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Node.js のインストール
COPY --from=node:latest /usr/local/bin /usr/local/bin
COPY --from=node:latest /usr/local/lib /usr/local/lib

# Laravel プロジェクトをコピー（backendディレクトリ）
COPY backend /var/www/html/backend

# パーミッションの変更（backend が存在することを確認）
RUN chown -R www-data:www-data /var/www/html/backend
RUN mkdir -p /var/www/html/backend/storage && chmod -R 775 /var/www/html/backend/storage
RUN mkdir -p /var/www/html/backend/bootstrap/cache && chmod -R 775 /var/www/html/backend/bootstrap/cache

WORKDIR /var/www/html/backend

# エントリースクリプトをコピー
COPY ./docker/laravel/entry.sh /usr/local/bin/entry.sh
RUN chmod +x /usr/local/bin/entry.sh

CMD ["/usr/local/bin/entry.sh"]
