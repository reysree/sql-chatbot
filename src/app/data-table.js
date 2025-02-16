import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DataTable({ columns, data }) {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="border border-gray-400">
        <TableHeader>
          <TableRow className="border-b-2 border-gray-400">
            {columns.map((column) => (
              <TableHead
                key={column}
                className="font-bold text-black border-r-2 border-gray-400 p-2"
              >
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex} className="border-b-2 border-gray-400">
              {row.map((value, colIndex) => (
                <TableCell
                  key={`${rowIndex}-${colIndex}`}
                  className="border-r-2 border-gray-400 p-2"
                >
                  {value}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
