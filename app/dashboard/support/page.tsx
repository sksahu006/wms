import Link from "next/link"
import { CheckCircle2, Clock, MessageSquare, MoreHorizontal, Plus, Search, SlidersHorizontal, XCircle } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SupportPage() {
  const supportTickets = [
    {
      id: "TKT-001",
      title: "Request for additional security",
      date: "Feb 10, 2023",
      status: "Resolved",
      priority: "Medium",
      lastUpdated: "Feb 15, 2023",
      category: "Security",
    },
    {
      id: "TKT-002",
      title: "Maintenance needed for loading dock",
      date: "Mar 5, 2023",
      status: "In Progress",
      priority: "High",
      lastUpdated: "Mar 7, 2023",
      category: "Maintenance",
    },
    {
      id: "TKT-003",
      title: "Billing discrepancy on invoice #INV-006",
      date: "Mar 10, 2023",
      status: "Pending",
      priority: "Low",
      lastUpdated: "Mar 10, 2023",
      category: "Billing",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <Button asChild>
          <Link href="/dashboard/support/new">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tickets
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              All support tickets
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Tickets
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              Pending and in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Tickets
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            View and manage your support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Tickets</TabsTrigger>
                <TabsTrigger value="open">Open</TabsTrigger>
                <TabsTrigger value="resolved">Resolved</TabsTrigger>
              </TabsList>
              
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search tickets..."
                    className="w-[200px] pl-8"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </div>
            </div>
            
            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.id}</TableCell>
                        <TableCell>{ticket.title}</TableCell>
                        <TableCell>{ticket.category}</TableCell>
                        <TableCell>{ticket.date}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              ticket.priority === "High"
                                ? "border-red-500 text-red-500"
                                : ticket.priority === "Medium"
                                ? "border-yellow-500 text-yellow-500"
                                : "border-blue-500 text-blue-500"
                            }
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ticket.status === "Resolved"
                                ? "default"
                                : ticket.status === "In Progress"
                                ? "outline"
                                : "secondary"
                            }
                            className={
                              ticket.status === "Resolved"
                                ? "bg-green-500"
                                : ticket.status === "In Progress"
                                ? "border-yellow-500 text-yellow-500"
                                : "bg-blue-500"
                            }
                          >
                            {ticket.status === "Resolved" && (
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                            )}
                            {ticket.status === "In Progress" && (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {ticket.status === "Pending" && (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {ticket.status}
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
                                <Link href={`/dashboard/support/${ticket.id}`}>
                                  View details
                                </Link>
                              </DropdownMenuItem>
                              {ticket.status !== "Resolved" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem>Add comment</DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    Close ticket
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
            </TabsContent>
            
            <TabsContent value="open">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets
                      .filter((ticket) => ticket.status !== "Resolved")
                      .map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>{ticket.category}</TableCell>
                          <TableCell>{ticket.date}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                ticket.priority === "High"
                                  ? "border-red-500 text-red-500"
                                  : ticket.priority === "Medium"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-blue-500 text-blue-500"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                ticket.status === "In Progress"
                                  ? "outline"
                                  : "secondary"
                              }
                              className={
                                ticket.status === "In Progress"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "bg-blue-500"
                              }
                            >
                              {ticket.status === "In Progress" && (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {ticket.status === "Pending" && (
                                <Clock className="mr-1 h-3 w-3" />
                              )}
                              {ticket.status}
                            </Badge>
                          </TableCell>
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
            
            <TabsContent value="resolved">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets
                      .filter((ticket) => ticket.status === "Resolved")
                      .map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell className="font-medium">{ticket.id}</TableCell>
                          <TableCell>{ticket.title}</TableCell>
                          <TableCell>{ticket.category}</TableCell>
                          <TableCell>{ticket.date}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                ticket.priority === "High"
                                  ? "border-red-500 text-red-500"
                                  : ticket.priority === "Medium"
                                  ? "border-yellow-500 text-yellow-500"
                                  : "border-blue-500 text-blue-500"
                              }
                            >
                              {ticket.priority}
                            </Badge>
                          </TableCell>
                          <TableCell>{ticket.lastUpdated}</TableCell>
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
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
