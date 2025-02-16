"use client";

import { useState, useEffect, useRef } from "react";
import ChatMessages from "./chat-messages";
import { Send } from "@mui/icons-material";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
    //console.log("The chat message sent by user is : ", message);
    const userMessage = { role: "user", content: message.trim() };
    setMessages((prevMessages) => [
      ...prevMessages,
      userMessage,
      //{ role: "assistant", content: "" },
    ]);
    setMessage("");
    setIsLoading(true);
    try {
      //console.log("Messages before sending request:", messages);

      const response = await fetch("/api/employee", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userInput: [...messages, userMessage] }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch response from the server");
      }

      const data = await response.json();
      console.log("Received Data:", data);
      if (data.error) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "user", content: data.error }, // Add the formatted response
        ]);
      } else {
        // Append the assistant's response to the messages
        setMessages((prevMessages) => [
          ...prevMessages,
          { role: "assistant", content: data }, // Add the formatted response
        ]);
      }
      console.log("The messages in the array are : ", messages);
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
      <div className="flex-grow overflow-y-auto relative">
        {isLoading && (
          <div className="absolute top-1/2 left-1/2 transfom -translate-x-1/2 -translate-y-1/2 z-10 bg-white bg-opacity-80 p-3 rounded-md shadow-md">
            <span>Loading...</span>
          </div>
        )}
        <ChatMessages messages={messages} />
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex p-2 py-1 bg-white">
        <Input
          className="flex-1 h-10 text-lg shadow"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button className="h-10" type="submit" size="icon" disabled={isLoading}>
          {isLoading ? <span className="loader">...</span> : <Send />}
        </Button>
      </form>
    </div>
  );
}
