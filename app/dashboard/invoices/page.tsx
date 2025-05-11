import {
  CheckCircle2,
  Clock,
  FileText,
  MoreHorizontal,
  Plus,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import Link from "next/link";
import InvoiceSearchControls from "@/components/SearchComponent";
import { getInvoices } from "@/app/actions/invoiceActions/invoice";
import { formatToUTCISOString } from "@/lib/formatToUTCISOString";
import { getServerAuth } from "@/lib/auth";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { tab?: string; search?: string; page?: string };
}) {
  const session = await getServerAuth()
  const tab = searchParams?.tab || "all";
  const search = searchParams?.search || "";
  const page = parseInt(searchParams?.page || "1", 10);

  const status = tab === "all" ? undefined : tab.toUpperCase() as "PAID" | "PENDING" | "OVERDUE";
  const result = await getInvoices({ page, limit: 10, search, status });

  if (!result.success || !result.data) {
    return <div>Error: {result.error || "No data available"}</div>;
  }

  const { invoices, stats, totalPages, totalItems } = result.data;

  // Format stats for display
  const invoiceStats = [
    {
      title: "Total Invoices",
      value: `₹${stats.total.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.total.count} invoices`,
    },
    {
      title: "Paid",
      value: `₹${stats.paid.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.paid.count} invoices`,
    },
    {
      title: "Pending",
      value: `₹${stats.pending.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.pending.count} invoices`,
    },
    {
      title: "Overdue",
      value: `₹${stats.overdue.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.overdue.count} invoices`,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        {session && session.user.role === "ADMIN" && <Link href="/dashboard/invoices/add">
          <Button variant="default" size="sm">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {invoiceStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoice Management</CardTitle>
          <CardDescription>View and manage all client invoices</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={tab} className="space-y-4">
            <InvoiceSearchControls tab={tab} search={search} />
            <TabsContent value={tab}>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>{invoice.client.name || invoice.client.id}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(invoice.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                          </div>
                        </TableCell>
                        <TableCell>
                          ₹{invoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>{new Date(invoice.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}</TableCell>
                        <TableCell>{new Date(invoice.dueDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "PAID"
                                ? "default"
                                : invoice.status === "PENDING"
                                  ? "outline"
                                  : "secondary"
                            }
                            className={
                              invoice.status === "PAID"
                                ? "bg-green-500"
                                : invoice.status === "PENDING"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {invoice.status === "PAID" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {invoice.status === "PENDING" && <Clock className="mr-1 h-3 w-3" />}
                            {invoice.status === "OVERDUE" && <XCircle className="mr-1 h-3 w-3" />}
                            {invoice.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link href={`/dashboard/invoices/${invoice.id}`}>View invoice</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>Download PDF</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuSeparator />
                              {session && session.user.role === "ADMIN" && <DropdownMenuItem asChild>
                                <Link href={`/dashboard/invoices/edit/${invoice.id}`}>Edit invoice</Link>
                              </DropdownMenuItem>}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm text-muted-foreground">
                  Showing {invoices.length} of {totalItems} invoices
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    asChild
                  >
                    <Link href={{ pathname: "/dashboard/invoices", query: { tab, search, page: page - 1 } }}>
                      Previous
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    asChild
                  >
                    <Link href={{ pathname: "/dashboard/invoices", query: { tab, search, page: page + 1 } }}>
                      Next
                    </Link>
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}