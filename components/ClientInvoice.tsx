
import { getInvoices } from "@/app/actions/invoiceActions/invoice";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { FileText } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";

export default async function Invoice({ clientId, searchParams }: { clientId: string; searchParams: { page?: string } }) {
  const page = parseInt(searchParams.page || "1");
  const limit = 10;

  const response = await getInvoices({ clientId, page, limit });

  if (!response.success) {
    return <div>Error: {response.error}</div>;
  }

  if (!response.data) {
    return <div>Error: Invalid response data</div>;
  }

  const { invoices, totalPages } = response.data;

  return (
    <div>
      {/* <h2 className="p-2">Client {invoices[0]?.client?.name}'s Invoices</h2> */}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Status</TableHead>
            {/* <TableHead className="text-right">Actions</TableHead> */}
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length > 0 ? (
            invoices.map((invoice:any) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">{invoice.id}</TableCell>
                <TableCell>{invoice.amount}</TableCell>
                <TableCell>{new Date(invoice.date).toISOString().split("T")[0]}</TableCell>
                <TableCell>{new Date(invoice.dueDate).toISOString().split("T")[0]}</TableCell>
                <TableCell>
                  <Badge
                    variant={invoice.status === "PAID" ? "default" : "outline"}
                    className={invoice.status === "PAID" ? "bg-green-500" : "border-yellow-500"}
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
                {/* <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </TableCell> */}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No invoices found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="pagination mt-4 flex gap-4 items-center">
        <Link
          href={`?page=${page - 1}`}
          className={`btn-prev ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Previous
        </Link>
        <span>{`Page ${page} of ${totalPages}`}</span>
        <Link
          href={`?page=${page + 1}`}
          className={`btn-next ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
