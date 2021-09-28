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

### API

- /api/get_ranking

    全 trainingStep に関するランキングデータと平均スコアを取得する.

    - メソッド: GET
    - パラメータ
        - size (Optional, default=5): 上位何位まで取得するか
    - 返り値
        - ranking: "trainingStep => (token, userName, score) のリスト" の Object
        - avgScore: "trainingStep => 平均スコア" の Object

- /api/register_game

    新しいゲームを登録する.

    - メソッド: POST
    - パラメータ
        - token: ゲームのトークン
        - trainingStep: 学習ステップ
        - score: ゲームのスコア
    - 返り値
        - userName: 仮作成したユーザ名

- /api/update_name

    ユーザ名を更新する.

    - メソッド: POST
    - パラメータ
        - token: ゲームのトークン
        - userName: 新しいユーザ名
    - 返り値
