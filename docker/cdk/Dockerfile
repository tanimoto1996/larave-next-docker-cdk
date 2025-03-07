# docker/cdk.Dockerfile
FROM node:23

WORKDIR /infra

# cdkディレクトリ内のパッケージファイルをコピー
# COPY cdk/package.json cdk/yarn.lock ./
# RUN yarn install --frozen-lockfile

# cdk の全ソースコードをコピー
COPY ../ /infra

# CMD ["npx", "cdk", "deploy"]
