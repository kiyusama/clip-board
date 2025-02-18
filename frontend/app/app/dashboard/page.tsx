"use client";

import { useUser } from "@clerk/nextjs";
import apiClient from "@/lib/apiClient";
import { useEffect, useState } from "react";
import { BoardType } from "@/types";

export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser();
  const [clipBoards, setClipBoards] = useState([]);

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await apiClient.get("clipboards/get_boards", {
          params: { userId: user?.id },
        });

        setClipBoards(response.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBoards();
  }, [user?.id]);

  const copyHandler = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <h1>Dashboard</h1>
      <ul>
        {clipBoards.map((clipboard: BoardType) => (
          <li key={clipboard.id}>
            <input type="text" value={clipboard.content} />
            {clipboard.content}
            <button onClick={() => copyHandler(clipboard.content)}>copy</button>
          </li>
        ))}
      </ul>
    </>
  );
}
