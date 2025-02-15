// 必要なモジュールをインポート
const express = require("express");
const app = express();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");

const prisma = new PrismaClient().$extends(withAccelerate());

// ポート番号を設定
const PORT = 8000;

app.use(cors());
app.use(express.json());

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/api/auth/register", async (req, res) => {
  const { id, username } = req.body;
  const user = await prisma.user.create({
    data: {
      id,
      username,
    },
  });

  res.res({ user });
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});
