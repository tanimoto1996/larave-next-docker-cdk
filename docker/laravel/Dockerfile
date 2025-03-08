FROM php:8.4-fpm

# ユーザーとグループのIDを指定
# ※ Linuxの一般ユーザーのデフォルトのID
ARG UID=1000
ARG GID=1000

WORKDIR /var/www/html

# install-php-extensionsスクリプトを使用せずにPHP拡張機能を手動でインストールする
RUN apt-get update && apt-get install -y --no-install-recommends \
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
RUN usermod -u $UID www-data && groupmod -g $GID www-data;

COPY docker/laravel/php.ini /usr/local/etc/php/php.ini

# Composer install
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# install Node.js
COPY --from=node:latest /usr/local/bin /usr/local/bin
COPY --from=node:latest /usr/local/lib /usr/local/lib

RUN chown -R www-data:www-data /var/www/html
RUN mkdir -p /var/www/html/storage && \
    chmod -R 775 /var/www/html/storage

RUN mkdir -p /var/www/html/bootstrap/cache && \
    chmod -R 775 /var/www/html/bootstrap/cache