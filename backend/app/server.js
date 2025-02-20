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
    const clipboards = await prisma.clipBoard.findMany({
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

//clipboardsを更新
app.put("/api/clipboards/update_boards", async (req, res) => {
  try {
    const { clipboards } = req.body;
    const updated_boards = [];
    for (const board of clipboards) {
      const updated_board = await prisma.clipBoard.update({
        where: {
          id: board.id,
        },
        data: {
          title: board.title,
          content: board.content,
          isHiden: board.isHiden,
        },
        // create: {
        //   title: "title",
        // },
      });
      updated_boards.push(updated_board);
    }

    res.json(updated_boards);
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});
