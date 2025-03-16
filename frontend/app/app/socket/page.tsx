"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { BoardType } from "@/types";
import debounce from "lodash/debounce";
import apiClient from "@/lib/apiClient";
import { socket } from "@/lib/socket";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [clipboards, setClipboards] = useState<BoardType[]>([]);

  //初回接続時
  useEffect(() => {
    //userIdを入手できるまで待機
    if (!user?.id) {
      return;
    }

    //userIdをサーバへ送る
    const userId = user?.id;
    socket.emit("send_userId", { userId });

    socket.on("receive_boards", (data) => {
      setClipboards(data);
    });

    return () => {
      socket.off("receive_boards");
      socket.off("receive_update");
    };
  }, [user?.id]);

  // useStateの要素をinputに応じて逐一変化させるため必要
  const changeHandler = (
    id: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const updatedBoards = clipboards.map((board: BoardType) =>
      board.id === id ? { ...board, content: e.target.value } : board
    );

    handleDebounce(updatedBoards);
    socket.emit("update_boards", updatedBoards);
  };

  //デバウンス処理
  const handleDebounce = useCallback(
    debounce(async (clipboards) => {
      try {
        const response = await apiClient.put("/api/clipboards/update_boards", {
          clipboards,
        });

        setClipboards(response.data);
        alert("ok");
      } catch (error) {
        console.log(error);
      }
    }, 1000),
    []
  );

  //テキストコピーを行う
  const copyHandler = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.log(error);
    }
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
            <button onClick={() => copyHandler(clipboard.content)}>copy</button>
          </li>
        ))}
      </ul>
    </>
  );
}
