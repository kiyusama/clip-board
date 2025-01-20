"use client";

import apiClient from "@/lib/apiClient";
import { useState } from "react";

export default function Button() {
  const [message, setMessage] = useState("");

  const accessApi = async () => {
    try {
      const response = await apiClient.get("/hello");
      setMessage(response.data.message);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <h2>hi button</h2>
      <p>{message}</p>
      <button onClick={accessApi}>test</button>
    </>
  );
}
