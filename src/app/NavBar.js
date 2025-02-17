"use client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function NavBar({ db_list, setSelectedDb }) {
  const [db, setDb] = useState("ai"); // Default database

  const changeDatabase = (database) => {
    setDb(database);
    setSelectedDb(database); // Update the selected database in the parent component
  };

  return (
    <nav className="flex justify-between items-center bg-[#1976D2] border-r-2 rounded-sm py-3 px-3">
      <h3 className="text-white">Text SQL</h3>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">{db}</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuGroup>
              {db_list.map((database, index) => (
                <DropdownMenuItem key={index}>
                  <Button onClick={() => changeDatabase(database)}>
                    {database}
                  </Button>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button className="ml-3">Login</Button>
      </div>
    </nav>
  );
}
