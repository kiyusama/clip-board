// 必要なモジュールをインポート
const express = require("express");
const app = express();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { Webhook } = require("svix");

const prisma = new PrismaClient();

// ポート番号を設定
const PORT = 8000;

app.use(cors());
app.use(express.json());

// サーバーを起動
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// テスト用
app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.post("/api/webhooks/user", async (req, res) => {
  try {
    const webhook = new Webhook(process.env.SIGNING_SECRET);
    const event = webhook.verify(JSON.stringify(req.body), req.headers);
    const { id, first_name } = event.data;

    const user = await prisma.user.create({
      data: {
        id,
        username: first_name,
        // clipboardsを一つ作成
        clipboards: {
          create: {
            title: "title",
          },
        },
      },
      include: { clipboards: true },
    });

    res.status(200).send({ user });
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid signature");
  }
});

app.get("/api/clipboards/get_boards", async (req, res) => {
  try {
    const { userId } = req.body;
    const clipboards = prisma.clipBoard.findMany({
      where: {
        authorId: userId,
      },
    });

    res.json(clipboards);
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});
