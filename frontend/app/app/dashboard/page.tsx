"use client";

import { useUser } from "@clerk/nextjs";
import apiClient from "@/lib/apiClient";
import { useEffect } from "react";

export default function Example() {
  const { isSignedIn, user, isLoaded } = useUser();

  useEffect(() => {
    const fetchBoards = async () => {
      try {
        const response = await apiClient.get("clipboards/get_boards", {
          params: { userId: user?.id },
        });
        console.log(response);
        alert(response);
      } catch (error) {
        console.log(error);
      }
    };

    fetchBoards();
  }, [isSignedIn, isLoaded, user]);

  return (
    <>
      <h1>Dashboard</h1>
    </>
  );
}
