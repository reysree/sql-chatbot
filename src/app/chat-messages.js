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
                component="div"
                sx={{
                  maxWidth: "80%",
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
                  : message.content}
              </Typography>
            }
            // If the content is a data array, render it in a table
            secondary={
              message.content?.columns &&
              message.content?.data && (
                <DataTable
                  columns={message.content.columns}
                  data={message.content.data}
                />
              )
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
