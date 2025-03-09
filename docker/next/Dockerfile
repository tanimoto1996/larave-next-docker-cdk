FROM node:23

WORKDIR /var/www/html

# package.json のコピー & インストール
COPY frontend/package*.json ./

RUN npm install

# ソースコード全体をコピー
COPY frontend ./

WORKDIR /var/www/html/frontend

# 開発用なら dev、本番用なら start 等
CMD ["npm", "run", "dev"]
