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

  return (
    <>
      <h1>Dashboard</h1>
      <ul>
        {clipBoards.map((clipboard: BoardType) => (
          <li key={clipboard.id}>{clipboard.content}</li>
        ))}
      </ul>
    </>
  );
}
