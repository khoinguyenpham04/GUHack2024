// app/gameActions.ts
"use server";

import { redirect } from "next/navigation";
import { PARTYKIT_URL } from "../env";

export async function joinGame(gameId: string) {
  const res = await fetch(`${PARTYKIT_URL}/party/${gameId}`, {
    method: "POST",
    body: JSON.stringify({ type: "ALIVE-QUERY" }),
    headers: {
      "Content-Type": "application/json"
    }
  });

  if (res.status !== 200) {
    redirect("/invalid");
  }
  redirect(`/${gameId}`);
}

export async function createGame() {
  const randomId = () => Math.random().toString(36).substring(2, 10);
  redirect(`/${randomId()}`);
}