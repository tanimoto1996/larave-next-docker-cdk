# Laravel/Next/CDK/Docker の環境構築

Laravel 起動
php artisan serve --host=0.0.0.0 --port=8000

# Laravel Sanctum の設定

### Laravel 側

1. cors の設定調整
2. Kernel の middleware でセッション開始などの順番を調整する
3. .env で SESSION_DRIVER,SESSION_DOMAIN,SANCTUM_STATEFUL_DOMAINS,SESSION_SECURE_COOKIE,SESSION_COOKIE の設定をする
4. 今回は web ユーザーで対応したが、config/auth.php に sanctum の設定がないので注意が必要。

### Next 側

1. axios をインストール後、ヘルパー関数を作成、withCredentials と withXSRFToken は忘れない。
2. app/以下に pages ディレクトリを作成し、/sanctum/csrf-cookie 　 → 　 login の流れで cookie での認証をする
3. クライアント側は cookie で保持、サーバー側は databace で保持する
4. ログイン後に、Laravel の Auth::user() でログイン状態のユーザー情報を取得する

# Docker compose の流れ

1. Dockerfile 内の COPY や ADD コマンドは、イメージビルド時に実行され、コンテナ内にファイルをコピーします
2. volumes 設定は、コンテナ起動時に適用され、ホストとコンテナ間のディレクトリを共有します
3. volumes 設定は Dockerfile の COPY/ADD コマンドよりも優先されます（同じパスの場合）

つまり、ビルド時にコピーされたファイルも、volumes でマウントされると上書きされることになります。

このため、node_modules などで /var/www/html/frontend/node_modules/ のようなボリューム設定をしている場合は、Dockerfile でインストールした node_modules を保持するための工夫です。
