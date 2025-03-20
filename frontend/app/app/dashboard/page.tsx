"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { useUser, useAuth } from "@clerk/nextjs";
import { BoardType } from "@/types";
import debounce from "lodash/debounce";
import apiClient from "@/lib/apiClient";
import io from "socket.io-client";
import { Socket } from "socket.io-client";

export default function Dashboard() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [clipboards, setClipboards] = useState<BoardType[]>([]);
  const { getToken } = useAuth();
  const socketRef = useRef<Socket | null>(null);
  //初回接続時
  useEffect(() => {
    const setupSocket = async () => {
      //userIdを入手できるまで待機
      if (!user?.id) {
        return;
      }

      const token = await getToken();
      socketRef.current = io(process.env.NEXT_PUBLIC_BACKEND_URL, {
        extraHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      //userIdをサーバへ送る
      const userId = user?.id;

      //JWTでtoken認証の実装忘れずに
      socketRef.current.emit("send_userId", { userId });

      socketRef.current.on("receive_boards", (data) => {
        setClipboards(data);
      });
    };

    setupSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.off("receive_boards");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
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
    socketRef.current?.emit("update_boards", updatedBoards);
  };

  //デバウンス処理
  const handleDebounce = useCallback(
    debounce(async (clipboards: BoardType[]) => {
      try {
        const token = await getToken();
        const response = await apiClient.put(
          "/api/clipboards/update_boards",
          {
            clipboards,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setClipboards(response.data);
      } catch (error) {
        console.log(error);
      }
    }, 1000),
    []
  );

  //新規clipboard作成
  const createBoardHandler = async () => {
    try {
      const token = await getToken();
      const response = await apiClient.post(
        "/api/clipboards/create_board",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setClipboards(response.data);
      socketRef.current?.emit("update_boards", response.data);
    } catch (error) {
      console.log(error);
    }
  };

  //boardの削除
  const deleteBoardHandler = async (id: string) => {
    try {
      const token = await getToken();
      const response = await apiClient.delete(
        `/api/clipboards/delete_board/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setClipboards(response.data);
      socketRef.current?.emit("update_boards", response.data);
    } catch (error) {
      console.log(error);
    }
  };

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
            {clipboard.title}
            <h1></h1>
            <input
              type="text"
              value={clipboard.content ?? ""} //null時はから配列を指定
              onChange={(e) => changeHandler(clipboard.id, e)}
            />
            <button onClick={() => copyHandler(clipboard.content)}>copy</button>
            <button onClick={() => deleteBoardHandler(clipboard.id)}>
              delete
            </button>
          </li>
        ))}
      </ul>
      <button onClick={createBoardHandler}>create</button>
    </>
  );
}
