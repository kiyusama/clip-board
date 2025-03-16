"use client";

import io from "socket.io-client";
//backendへ接続
export const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL);
