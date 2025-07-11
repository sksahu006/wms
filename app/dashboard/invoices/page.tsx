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
import { getServerAuth } from "@/lib/auth";
import DeleteInvoiceButton from "@/components/DeleteInvoiceButton";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: { tab?: string; search?: string; page?: string };
}) {
  const session = await getServerAuth();
  const tab = searchParams?.tab || "all";
  const search = searchParams?.search || "";
  const page = parseInt(searchParams?.page || "1", 10);

  const status = tab === "all" ? undefined : tab.toUpperCase() as "PAID" | "PENDING" | "OVERDUE";
  const result = await getInvoices({ page, limit: 10, search, status });

  if (!result.success || !result.data) {
    return <div>Error: {result.error || "No data available"}</div>;
  }

  const { invoices, stats, totalPages, totalItems, customer } = result.data;

  // Format stats for display
  const invoiceStats = [
    {
      title: "Total Invoices",
      value: `₹${stats.total.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.total.count} invoices`,
      icon: <FileText className="h-5 w-5 text-blue-600" />,
    },
    {
      title: "Paid",
      value: `₹${stats.paid.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.paid.count} invoices`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
    {
      title: "Pending",
      value: `₹${stats.pending.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.pending.count} invoices`,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
    },
    {
      title: "Overdue",
      value: `₹${stats.overdue.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      description: `${stats.overdue.count} invoices`,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    },
  ];
  const customerStats = [
    {
      title: "Opening Balance",
      value: `₹${customer?.openingBalance?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <XCircle className="h-5 w-5 text-red-600" />,
    },
    {
      title: "Billed Amount",
      value: `₹${customer?.billedAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <FileText className="h-5 w-5 text-blue-600" />,
    },
    {
      title: "Received Amount",
      value: `₹${customer?.receivedAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <CheckCircle2 className="h-5 w-5 text-green-600" />,
    },
    {
      title: "Balance Amount",
      value: `₹${customer?.balanceAmount?.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`,
      icon: <Clock className="h-5 w-5 text-amber-600" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        {session && session.user.role === "ADMIN" && (
          <Link href="/dashboard/invoices/add">
            <Button variant="default" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        )}
      </div>

      {session && session.user.role === "ADMIN" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {invoiceStats.map((stat, index) => (
            <Card
              key={index}
              className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : session && session.user.role === "CUSTOMER" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            ...invoiceStats.filter(
              (stat) =>
                stat.title === "Total Invoices" ||
                stat.title === "Paid" ||
                stat.title === "Pending"
            ),
            ...customerStats.filter((stat) => stat.title === "Opening Balance"),
          ].map((stat, index) => (
            <Card
              key={index}
              className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>

              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {invoiceStats
            .filter(
              (stat) =>
                stat.title === "Total Invoices" ||
                stat.title === "Paid" ||
                stat.title === "Pending"
            )
            .map((stat, index) => (
              <Card
                key={index}
                className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            ))}
        </div>
      )}


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
                    <TableRow className="bg-blue-900">
                      <TableHead className="text-white">Invoice</TableHead>
                      <TableHead className="text-white">Client</TableHead>
                      <TableHead className="text-white">Amount</TableHead>
                      <TableHead className="text-white">Date</TableHead>
                      <TableHead className="text-white">Due Date</TableHead>
                      <TableHead className="text-white">Status</TableHead>
                      <TableHead className="text-right text-white">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-black dark:text-white bg-white dark:bg-black">
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell>
                          <div className="text-gray-700">{(invoice.client.companyName)}</div>
                          {/* <div className="text-xs text-gray-500">
                            {(invoice.client.companyName)}
                          </div> */}
                        </TableCell>
                        <TableCell>
                          ₹{invoice.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.date).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </TableCell>
                        <TableCell>
                          {new Date(invoice.dueDate).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </TableCell>
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
                        <TableCell className="text-right flex items-center justify-end space-x-2">
                          <DeleteInvoiceButton invoiceId={invoice.id} />
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
                              {session && session.user.role === "ADMIN" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem asChild>
                                    <Link href={`/dashboard/invoices/edit/${invoice.id}`}>
                                      Edit invoice
                                    </Link>
                                  </DropdownMenuItem>



                                </>
                              )}
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
                    className={`border-none text-white ${page === 1
                      ? 'bg-gradient-to-r from-purple-300 to-pink-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                  >
                    <Link
                      href={{
                        pathname: "/dashboard/invoices",
                        query: { tab, search, page: page - 1 },
                      }}
                    >
                      Previous
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    asChild
                    className={`border-none text-white ${page >= totalPages
                      ? 'bg-gradient-to-r from-green-300 to-blue-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      }`}
                  >
                    <Link
                      href={{
                        pathname: "/dashboard/invoices",
                        query: { tab, search, page: page + 1 },
                      }}
                    >
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
