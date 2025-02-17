"use client";

import { useState } from "react";
import ChatInterface from "./chat_interface";
import NavBar from "./NavBar";

export default function Home() {
  const db_list = ["ai", "fest"];
  const [selectedDb, setSelectedDb] = useState("ai"); // Default database

  return (
    <main>
      {/* Pass `setSelectedDb` to allow NavBar to update the state */}
      <NavBar db_list={db_list} setSelectedDb={setSelectedDb} />

      {/* Pass `selectedDb` to ChatInterface to use it in API calls */}
      <ChatInterface selectedDb={selectedDb} />
    </main>
  );
}
