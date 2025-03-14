"use client";

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import io from "socket.io-client";
import { BoardType } from "@/types";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [clipboards, setClipboards] = useState<BoardType[]>([]);

  //backendへ接続
  const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);

  //初回接続時
  useEffect(() => {
    //userIdをサーバへ送る
    const userId = user?.id;
    socket.emit("send_userId", { userId });

    socket.on("receive_boards", (data) => {
      setClipboards(data);
    });

    return () => socket.disconnect();
  }, []);

  //テキストコピーを行う
  const copyHandler = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.log(error);
    }
  };

  // useStateの要素をinputに応じて逐一変化させるため必要
  const changeHandler = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedBoards = clipboards.map((board: BoardType) =>
      board.id === id ? { ...board, content: e.target.value } : board
    );
    setClipboards(updatedBoards);
  };

  return (
    <>
      <h1>socket</h1>
      <ul>
        {clipboards.map((clipboard: BoardType) => (
          <li key={clipboard.id}>
            <input
              type="text"
              value={clipboard.content}
              onChange={(e) => changeHandler(clipboard.id, e)}
            />
            {clipboard.content}
            <button onClick={() => copyHandler(clipboard.content)}>copy</button>
          </li>
        ))}
      </ul>
    </>
  );
}
