# ECRへのログイン用コマンドを生成し実行
aws ecr get-login-password --region ap-northeast-1 | docker login --username AWS --password-stdin 058264478049.dkr.ecr.ap-northeast-1.amazonaws.com

# プロジェクトルートからバックエンドイメージをビルド
docker build -t visionaryfuture-backend -f docker/laravel/Dockerfile.ecs .

# イメージにタグ付け
docker tag visionaryfuture-backend:latest 058264478049.dkr.ecr.ap-northeast-1.amazonaws.com/visionaryfuture-backend:latest

# イメージをECRにプッシュ
docker push 058264478049.dkr.ecr.ap-northeast-1.amazonaws.com/visionaryfuture-backend:latest