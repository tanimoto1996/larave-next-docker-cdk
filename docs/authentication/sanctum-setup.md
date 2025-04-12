# Laravel Sanctum 認証設定ガイド

Laravel SanctumとNext.jsを連携させた認証システムの設定方法について解説します。

## Laravel側の設定

1. CORSの設定調整
   - `config/cors.php`で適切なオリジンやヘッダーを設定

2. Kernelのmiddlewareの順序調整
   - セッション開始などの順番を調整する
   - `app/Http/Kernel.php`の`api`ミドルウェアグループを確認

3. 環境変数の設定
   `.env`ファイルで以下の項目を設定:
   - `SESSION_DRIVER`
   - `SESSION_DOMAIN`
   - `SANCTUM_STATEFUL_DOMAINS`
   - `SESSION_SECURE_COOKIE`
   - `SESSION_COOKIE`

4. 認証設定の確認
   - `config/auth.php`にSanctum関連の設定がないことに注意
   - 今回はwebユーザーで対応

## Next.js側の設定

1. Axiosのセットアップ
   - axiosをインストール
   - ヘルパー関数を作成
   - `withCredentials`と`withXSRFToken`オプションを必ず設定

2. 認証フロー
   - `/sanctum/csrf-cookie`エンドポイントへのリクエスト
   - ログインリクエスト
   - クライアント側はCookieでセッション情報を保持
   - サーバー側はデータベースでセッション情報を保持

3. ユーザー情報の取得
   - ログイン後、LaravelのAuth::user()でログインユーザーの情報を取得