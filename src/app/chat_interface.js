"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessages from "./chat-messages";
import { TextField, Button } from "@mui/material";
import { Send } from "@mui/icons-material";

export default function ChatInterface() {
  const [messages, setMessages] = useState(() => []);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Client-side rendering active");
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

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

      const response = await fetch("/api/invoice", {
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "92vh",
        justifyContent: "space-between",
      }}
    >
      <div style={{ flexGrow: 1, overflowY: "auto", position: "relative" }}>
        {isLoading && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: "10px",
            borderRadius: "5px",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)"
          }}>
            <span>Loading...</span>
          </div>
        )}
        <ChatMessages messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", padding: "10px" }}
      >
        <TextField
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          style={{ flex: 1 }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" size="icon" disabled={isLoading}>
          {isLoading ? <span className="loader">...</span> : <Send />}
        </Button>
      </form>
    </div>
  );
}
