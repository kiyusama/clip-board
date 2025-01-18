// 必要なモジュールをインポート
const express = require("express");
const app = express();

// ポート番号を設定
const PORT = 3000;

// ルートハンドラーを定義
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
