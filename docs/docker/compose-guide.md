# Docker Compose ガイド

このドキュメントでは Docker Compose を使用したアプリケーション環境の構築と注意点について説明します。

## Docker Compose の基本的な流れ

1. **Dockerfile の処理順序**
   - `COPY` や `ADD` コマンドは、イメージビルド時に実行されます
   - これらのコマンドはコンテナ内にファイルをコピーします

2. **volumes の設定**
   - `volumes` 設定はコンテナ起動時に適用されます
   - ホストとコンテナ間のディレクトリを共有します
   - **重要**: `volumes` 設定は Dockerfile の `COPY`/`ADD` コマンドよりも優先されます（同じパスの場合）

この仕組みにより、ビルド時にコピーされたファイルも、`volumes` でマウントされると上書きされることになります。

## node_modules の取り扱い

`/var/www/html/frontend/node_modules/` のようなボリューム設定をしている場合：
- これは Dockerfile でインストールした node_modules を保持するための工夫です
- 開発中のソースコードはホストと共有しつつ、パフォーマンス向上のために node_modules はコンテナ内に保持します

## プロジェクトの Docker 構成

プロジェクトのDocker構成は以下のディレクトリに格納されています：
- `/docker`
  - `compose.yml` - メインの Docker Compose 設定ファイル
  - `/cdk` - CDK 関連のDockerファイル
  - `/laravel` - Laravel 環境のDockerファイル
  - `/next` - Next.js 環境のDockerファイル
  - `/nginx` - Nginx 設定ファイル