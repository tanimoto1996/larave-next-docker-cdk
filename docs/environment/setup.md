# 開発環境のセットアップガイド

## ローカル開発環境

### Laravel の起動

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

### VS Code DevContainers を使用した開発環境

1. グローバルインストール
   ```bash
   npm install -g @devcontainers/cli
   ```

2. Frontend コンテナの起動
   ```bash
   devcontainer up --workspace-folder ./frontend/
   ```

3. Backend コンテナの起動
   ```bash
   devcontainer up --workspace-folder ./backend/
   ```

4. VS Code からの接続
   - F1 > Remote-Containers: Attach to Running Container
   - 該当コンテナを選択