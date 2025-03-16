// 必要なモジュールをインポート
const express = require("express");
const app = express();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { Webhook } = require("svix");
const { Server } = require("socket.io");
const http = require("http");
const e = require("express");

// ポート番号を設定
const PORT = process.env.LISTENING_PORT;

const prisma = new PrismaClient();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "PUT", "POST", "DELETE"],
  },
});

app.use(cors());
app.use(express.json());

//接続を確立
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // 初回の処理
  socket.on("send_userId", async ({ userId }) => {
    socket.userId = userId;

    try {
      const clipboards = await prisma.clipBoard.findMany({
        where: {
          authorId: socket.userId,
        },
      });

      socket.emit("receive_boards", clipboards);
    } catch (error) {
      console.log(error);
      socket.emit("receive_boards", []); // エラー時には空配列を返す
    }
  });

  //あとで
  socket.on("delete_board", (data) => {
    io.emit("receive_boards", data);
  });

  socket.on("update_boards", (data) => {
    io.emit("receive_boards", data); //全ユーザに送信
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: ", socket.id);
  });
});

//サーバを起動
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost: ${PORT}`);
});

// clerkからWebhookでユーザー情報取得
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

//REST APIの場合
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

//新規board作成
app.post("/api/clipboards/create_board", async (req, res) => {
  try {
    const { userId } = req.body;
    const newBoard = await prisma.clipBoard.create({
      data: {
        title: "title",
        authorId: userId,
      },
    });

    res.json(newBoard);
  } catch (error) {
    console.log(error);
    res.status(400);
  }
});

//boardの削除
app.delete("/api/clipboards/delete_board/:id", async (req, res) => {
  try {
    const deletedBoard = await prisma.clipBoard.delete({
      where: {
        id: req.params.id,
      },
    });

    res.json(deletedBoard);
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
          isHidden: board.isHidden,
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
