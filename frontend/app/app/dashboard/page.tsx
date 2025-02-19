"use client";

import { useUser } from "@clerk/nextjs";
import apiClient from "@/lib/apiClient";
import React, { useEffect, useState } from "react";
import { BoardType } from "@/types";

export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [clipboards, setClipboards] = useState<BoardType[]>([]);

  useEffect(() => {
    //clipboards一覧を取得
    const fetchBoards = async () => {
      try {
        const response = await apiClient.get("clipboards/get_boards", {
          params: { userId: user?.id },
        });

        setClipboards(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBoards();
  }, [user?.id]);

  //clipboardをアップデート
  const updateClipboard = async () => {
    try {
      const response = await apiClient.put("/clipboards/update_boards", {
        clipboards,
      });

      setClipboards(response.data);
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
      <h1>Dashboard</h1>
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
      <button onClick={() => updateClipboard()}>update</button>
    </>
  );
}
