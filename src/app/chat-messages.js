"use client";

import { List, ListItem, ListItemText, Typography } from "@mui/material";
import DataTable from "./data-table";

export default function ChatMessages(props) {
  const { messages } = props;

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={index}>
          <div
            className={`max-w p-3 rounded-lg ${
              message.role === "user"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-black"
            }`}
          >
            {/* Display table message or text content */}
            {message.content?.columns ? (
              <p className="mb-2 font-semibold">Here is the table data:</p>
            ) : (
              <p className="whitespace-pre-wrap">{message.content}</p>
            )}

            {/* Render DataTable if applicable */}
            {message.content?.columns && message.content?.data && (
              <div className="mt-2 w-full">
                <DataTable
                  columns={message.content.columns}
                  data={message.content.data}
                />
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
