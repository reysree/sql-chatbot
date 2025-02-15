"use client";
import * as React from "react";
import Button from "@mui/material/Button";

export default function NavBar() {
  return (
    <nav className="flex justify-between items-center bg-[#1976D2] border-r-2 rounded-sm py-3 px-3">
      <h3 className="text-white">Text SQL</h3>
      <Button className="text-white border-solid">Login</Button>
    </nav>
  );
}
