"use client";

import DataTable from "./data-table";

export default function ChatMessages({ messages }) {
  //console.log("")
  return (
    <div className="flex flex-col overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={index} className="flex w-full">
          {/* Ensure user messages are right-aligned and error messages are left-aligned */}
          {message.role === "error" ? (
            <div className="flex justify-start w-full">
              <div className="max-w-fit p-3 rounded-lg bg-red-600 text-white">
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ) : message.content?.columns ? (
            // Ensure Table Messages are Always Full Width
            <div className="w-full bg-gray-200">
              <p className="mb-2 font-semibold">Here is the table data:</p>
              <div className="mt-2 w-full">
                <DataTable
                  columns={message.content.columns}
                  data={message.content.data}
                />
              </div>
            </div>
          ) : (
            // User and Assistant Messages
            <div
              className={`flex w-full ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`p-3 rounded-lg max-w-fit ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-black"
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
