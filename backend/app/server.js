// 必要なモジュールをインポート
const express = require("express");
const app = express();
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { withAccelerate } = require("@prisma/extension-accelerate");
const { Webhook } = require("svix");
const { env } = require("process");

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

app.post("/api/webhooks/user", async (req, res) => {
  try {
    const webhook = new Webhook(process.env.SIGNING_SECRET);
    const evt = webhook.verify(JSON.stringify(req.body), req.headers);
    console.log("✅ Webhook verified successfully:", evt);
    res.status(200).send("Webhook received! oh yes!");
  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid signature!! oh no!");
  }
});

app.get("/api/hello", (req, res) => {
  res.json({ message: "Hello from Express!" });
});
