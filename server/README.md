# Server

## ライブラリ
- flask
- opencv-python

## 起動方法
```
python server.py  # サーバー本体を起動
python manager.py  # メモリ管理用プロセスを起動
```

## API

状態 (フレーム) は jpg 化したものを base64 でエンコードしている.  
クライアント側で base64 のデコードが必要. jpg はそのまま (raw 画像に変換せず) 扱えるはず.

- /reset
  環境を生成してリセットし, 初期状態を返す.  
  - パラメータ
    なし
  - 返り値
    {"state": 状態}

- /step
  ユーザーの行動を受け取り, 次状態を返す.
  - パラメータ
    {"action": ユーザーの行動 ("up", "down", "noop" のいずれか)}
  - 返り値
    {"next_state": 次状態, "reward": 報酬, "done": 終了フラグ}

## 使用例
(Python だが) 簡単な使用例が test.py にある.
