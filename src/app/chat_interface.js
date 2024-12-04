"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import ChatMessages from "./chat-messages";
import { TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function ChatInterface() {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!message.trim()) {
      return;
    }
    console.log("The chat message sent by user is : ", message);
    const userMessage = { role: "user", content: message.trim() };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      { role: "assistant", content: "" },
    ]);
    setMessage("");
    setIsLoading(true);
    try {
      console.log("Messages before sending request:", messages);

      const response = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server");
      }

      const data = await response.json();
      console.log("Received Data:", data);

      // Append the assistant's response to the messages
      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "assistant", content: data }, // Add the formatted response
      ]);
    } catch (error) {
      console.error("Error during POST request:", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-card rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 border-b flex items-center gap-2">
        <MessageCircle className="w-5 h-5" />
        <span className="font-medium">Chat</span>
      </div>
      <ChatMessages messages={messages} />
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <TextField
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[60px]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
          />
          <Button type="submit" size="icon" disabled={isLoading}>
            {isLoading ? (
              <span className="loader">...</span>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
