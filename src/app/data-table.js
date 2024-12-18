"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";

export default function DataTable({ columns, data }) {
  console.log("Received data for table:", { columns, data });

  if (!columns || !data || data.length === 0) {
    return (
      <Typography variant="body1" color="textSecondary" align="center">
        No data available to display.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column} style={{ fontWeight: "bold" }}>
                {column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {row.map((value, colIndex) => (
                <TableCell key={`${rowIndex}-${colIndex}`}>{value}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
