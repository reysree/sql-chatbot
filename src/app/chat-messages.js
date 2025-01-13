"use client";

import { List, ListItem, ListItemText, Typography } from "@mui/material";
import DataTable from "./data-table";

export default function ChatMessages(props) {
  const { messages } = props;

  return (
    <List sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
      {messages.map((message, index) => (
        <ListItem
          key={index}
          alignItems={message.role === "user" ? "flex-end" : "flex-start"}
        >
          <ListItemText
            primary={
              <Typography
                sx={{
                  maxWidth: "100%",
                  p: 1,
                  borderRadius: 1,
                  bgcolor:
                    message.role === "user" ? "primary.main" : "grey.200",
                  color:
                    message.role === "user"
                      ? "primary.contrastText"
                      : "text.primary",
                  whiteSpace: "pre-wrap",
                }}
              >
                {message.content?.columns 
                  ? "Here is the table data:"
                  : message.content || ""}
              </Typography>
            }
            secondary={
              message.content?.columns && message.content?.data ? (
                <div>
                  <DataTable
                    columns={message.content.columns}
                    data={message.content.data}
                  />
                </div>
              ) : (
                <div /> // Render an empty div for consistent structure
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
