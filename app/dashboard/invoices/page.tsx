import {
  ArrowDownUp,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function InvoicesPage() {
  const invoices = [
    {
      id: "INV-001",
      client: "Acme Corporation",
      clientId: "WMS001",
      amount: "₹1,200.00",
      date: "Jan 15, 2023",
      dueDate: "Feb 15, 2023",
      status: "Paid",
      spaces: ["WH-A-101"],
      period: "Jan 2023",
    },
    {
      id: "INV-002",
      client: "TechSolutions Inc",
      clientId: "WMS002",
      amount: "₹950.00",
      date: "Jan 20, 2023",
      dueDate: "Feb 20, 2023",
      status: "Paid",
      spaces: ["WH-A-102"],
      period: "Jan 2023",
    },
    {
      id: "INV-003",
      client: "Manufacturing Pro",
      clientId: "WMS005",
      amount: "₹2,500.00",
      date: "Feb 1, 2023",
      dueDate: "Mar 1, 2023",
      status: "Pending",
      spaces: ["WH-B-201", "WH-D-401", "WH-D-402"],
      period: "Feb 2023",
    },
    {
      id: "INV-004",
      client: "Retail Enterprises",
      clientId: "WMS004",
      amount: "₹1,800.00",
      date: "Feb 5, 2023",
      dueDate: "Mar 5, 2023",
      status: "Overdue",
      spaces: ["WH-C-301"],
      period: "Feb 2023",
    },
    {
      id: "INV-005",
      client: "Acme Corporation",
      clientId: "WMS001",
      amount: "₹1,200.00",
      date: "Feb 15, 2023",
      dueDate: "Mar 15, 2023",
      status: "Paid",
      spaces: ["WH-A-101"],
      period: "Feb 2023",
    },
    {
      id: "INV-006",
      client: "TechSolutions Inc",
      clientId: "WMS002",
      amount: "₹950.00",
      date: "Feb 20, 2023",
      dueDate: "Mar 20, 2023",
      status: "Pending",
      spaces: ["WH-A-102"],
      period: "Feb 2023",
    },
  ]

  const invoiceStats = [
    {
      title: "Total Invoices",
      value: "₹8,600.00",
      description: "All time revenue",
    },
    {
      title: "Paid",
      value: "₹4,300.00",
      description: "3 invoices",
    },
    {
      title: "Pending",
      value: "₹3,450.00",
      description: "2 invoices",
    },
    {
      title: "Overdue",
      value: "₹1,800.00",
      description: "1 invoice",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Create Invoice
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {invoiceStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold"> {stat.value}</div>
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
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Invoices</TabsTrigger>
                <TabsTrigger value="paid">Paid</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="overdue">Overdue</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search invoices..." className="w-[200px] pl-8" />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
                <Button variant="outline" size="icon">
                  <ArrowDownUp className="h-4 w-4" />
                  <span className="sr-only">Sort</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>

            <TabsContent value="all">
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
                        <TableCell className="font-medium">{invoice.id}</TableCell>
                        <TableCell>
                          <div>{invoice.client}</div>
                          <div className="text-sm text-muted-foreground">{invoice.period}</div>
                        </TableCell>
                        <TableCell>{invoice.amount}</TableCell>
                        <TableCell>{invoice.date}</TableCell>
                        <TableCell>{invoice.dueDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              invoice.status === "Paid"
                                ? "default"
                                : invoice.status === "Pending"
                                  ? "outline"
                                  : "secondary"
                            }
                            className={
                              invoice.status === "Paid"
                                ? "bg-green-500"
                                : invoice.status === "Pending"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "bg-red-500"
                            }
                          >
                            {invoice.status === "Paid" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                            {invoice.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                            {invoice.status === "Overdue" && <XCircle className="mr-1 h-3 w-3" />}
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
                              <DropdownMenuItem>View invoice</DropdownMenuItem>
                              <DropdownMenuItem>Download PDF</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {invoice.status === "Pending" && (
                                <>
                                  <DropdownMenuItem className="text-green-600">Mark as paid</DropdownMenuItem>
                                  <DropdownMenuItem>Send reminder</DropdownMenuItem>
                                </>
                              )}
                              {invoice.status === "Overdue" && (
                                <>
                                  <DropdownMenuItem className="text-green-600">Mark as paid</DropdownMenuItem>
                                  <DropdownMenuItem>Send reminder</DropdownMenuItem>
                                </>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Edit invoice</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600">Void invoice</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="paid">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter((invoice) => invoice.status === "Paid")
                      .map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>
                            <div>{invoice.client}</div>
                            <div className="text-sm text-muted-foreground">{invoice.period}</div>
                          </TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="pending">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter((invoice) => invoice.status === "Pending")
                      .map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>
                            <div>{invoice.client}</div>
                            <div className="text-sm text-muted-foreground">{invoice.period}</div>
                          </TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2">
                              Send Reminder
                            </Button>
                            <Button size="sm">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Paid
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="overdue">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices
                      .filter((invoice) => invoice.status === "Overdue")
                      .map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>
                            <div>{invoice.client}</div>
                            <div className="text-sm text-muted-foreground">{invoice.period}</div>
                          </TableCell>
                          <TableCell>{invoice.amount}</TableCell>
                          <TableCell>{invoice.date}</TableCell>
                          <TableCell>{invoice.dueDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="mr-2">
                              Send Reminder
                            </Button>
                            <Button size="sm">
                              <CheckCircle2 className="mr-1 h-3 w-3" /> Mark Paid
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

