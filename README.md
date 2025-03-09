# Laravel/Next/CDK/Dockerの環境構築

Laravel起動
php artisan serve --host=0.0.0.0 --port=8000


# Laravel Sanctumの設定

### Laravel側
1. corsの設定調整
2. Kernelのmiddlewareでセッション開始などの順番を調整する
3. .envでSESSION_DRIVER,SESSION_DOMAIN,SANCTUM_STATEFUL_DOMAINS,SESSION_SECURE_COOKIE,SESSION_COOKIEの設定をする
4. 今回はwebユーザーで対応したが、config/auth.phpにsanctumの設定がないので注意が必要。

### Next側
1. axiosをインストール後、ヘルパー関数を作成、withCredentialsとwithXSRFTokenは忘れない。
2. app/以下にpagesディレクトリを作成し、/sanctum/csrf-cookie　→　loginの流れでcookieでの認証をする
3. クライアント側はcookieで保持、サーバー側はdatabaceで保持する
4. ログイン後に、LaravelのAuth::user() でログイン状態のユーザー情報を取得する