# Server

### 起動方法

```bash
cd server
npm install #依存しているパッケージをインストール
node main #サーバーを起動
```

### データベースの準備
- ローカルで Postgres をインストール
- 適当な名前でユーザとデータベースを作成
- /.env ファイル (Heroku local の環境変数設定に使う) を作成し, 以下を記述
    - NODE_ENV="development"
    - DATABASE_URL="postgresql://&lt;username&gt;:&lt;password&gt;@&lt;host&gt;:&lt;port&gt;/&lt;dbname&gt;"

    リモート (Heroku app) では DATABASE_URL は postgres アドオン追加時に自動的に設定されており, heroku config コマンド等で確認できる.  
    NODE_ENV は手動で "production" に設定済み.

### データベースの更新
事前に環境変数 DATABASE_URL が設定されている必要がある.
```bash
export DATABASE_URL="postgresql://..."
```
などを実行しておく.

以下のコマンドでデータベースを更新できる.
```bash
cd server/db
npx sequelize-cli db:migrate  # db/migrations の情報をもとにスキーマを更新
npx sequelize-cli db:seed:all  # db/seeders の情報をもとにテストデータを更新
```
