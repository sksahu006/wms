import Link from "next/link";
import { CheckCircle2, Clock, MessageSquare, MoreHorizontal, Plus, Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupportTickets } from "@/app/actions/support/supportAction";
import { SupportStatus } from "@prisma/client";
import { getServerAuth } from "@/lib/auth";

interface Ticket {
  id: string;
  subject: string;
  category: string;
  space?: { spaceCode: string; name?: string | null } | null
  createdAt: Date;
  updatedAt: Date;
  priority: string;
  status: SupportStatus;
}

interface TicketTableProps {
  tickets: Ticket[];
  showResolvedDate?: boolean;
}

function TicketTable({ tickets, showResolvedDate = false }: TicketTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className=" bg-blue-900 " >
            <TableHead className="text-white" >Ticket ID</TableHead>
            <TableHead className="text-white" >Subject</TableHead>
            <TableHead className="text-white" >Category</TableHead>
            <TableHead className="text-white" >Space</TableHead>
            <TableHead className="text-white" >Date</TableHead>
            <TableHead className="text-white" >Priority</TableHead>
            {showResolvedDate ? <TableHead className="text-white" >Resolved</TableHead> : <TableHead className="text-white" >Status</TableHead>}
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='text-black dark:text-white bg-white dark:bg-black '>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell className="font-medium">{ticket.id}</TableCell>
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>{ticket.category}</TableCell>
              <TableCell>
                {ticket.space ? `${ticket.space.spaceCode} ${ticket.space.name || ''}` : '-'}
              </TableCell>
              <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={
                    ticket.priority === "HIGH"
                      ? "border-red-500 text-red-500"
                      : ticket.priority === "MEDIUM"
                        ? "border-yellow-500 text-yellow-500"
                        : "border-blue-500 text-blue-500"
                  }
                >
                  {ticket.priority}
                </Badge>
              </TableCell>
              {showResolvedDate ? (
                <TableCell>{new Date(ticket.updatedAt).toLocaleDateString()}</TableCell>
              ) : (
                <TableCell>
                  <Badge
                    variant={
                      ticket.status === "RESOLVED"
                        ? "default"
                        : ticket.status === "IN_PROGRESS"
                          ? "outline"
                          : "secondary"
                    }
                    className={
                      ticket.status === "RESOLVED"
                        ? "bg-green-500"
                        : ticket.status === "IN_PROGRESS"
                          ? "border-yellow-500 text-yellow-500"
                          : "bg-blue-500"
                    }
                  >
                    {ticket.status === "RESOLVED" && (
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                    )}
                    {ticket.status === "IN_PROGRESS" && (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {ticket.status === "OPEN" && (
                      <Clock className="mr-1 h-3 w-3" />
                    )}
                    {ticket.status}
                  </Badge>
                </TableCell>
              )}
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
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/support/${ticket.id}/edit`}>
                        Edit
                      </Link>
                    </DropdownMenuItem>
                    {ticket.status !== "RESOLVED" && (
                      <>
                        <DropdownMenuSeparator />
                        <Link href={`/dashboard/support/${ticket.id}/edit`}>
                          <DropdownMenuItem>Add comment</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            Close ticket
                          </DropdownMenuItem>
                        </Link>
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
  );
}

export default async function SupportPage({ searchParams }: { searchParams: { page?: string; tab?: string; search?: string } }) {
  const page = parseInt(searchParams.page || "1", 10);
  const tab = searchParams.tab || "all";
  const search = searchParams.search || "";
  const pageSize = 10;
  const session = await getServerAuth();

  const response = await getSupportTickets(page, pageSize, tab, search);

  if (!response.success || !response.tickets) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        <Card>
          <CardContent>
            <p className="text-red-500">Error loading tickets: {response.error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { tickets, pagination, stats } = response;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Support</h1>
        {session && session.user.role === "CUSTOMER" && <Button asChild>
          <Link href="/dashboard/support/new">
            <Plus className="mr-2 h-4 w-4" /> New Ticket
          </Link>
        </Button>}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="text-white bg-blue-900" >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Tickets
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTickets}</div>
            <p className="text-xs text-muted-foreground">
              All support tickets
            </p>
          </CardContent>
        </Card>
        <Card  className="text-white bg-blue-900" >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Open Tickets
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openTickets}</div>
            <p className="text-xs text-muted-foreground">
              Pending and in progress
            </p>
          </CardContent>
        </Card>
        <Card className="text-white bg-blue-900" >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Resolved Tickets
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.resolvedTickets}</div>
            <p className="text-xs text-muted-foreground">
              Successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>

      <Card  >
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
          <CardDescription>
            View and manage your support tickets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="text-white" >
                <TabsTrigger value="all" asChild>
                  <Link href={`/dashboard/support?page=1&tab=all${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                    All Tickets
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="open" asChild>
                  <Link href={`/dashboard/support?page=1&tab=open${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                    Open
                  </Link>
                </TabsTrigger>
                <TabsTrigger value="resolved" asChild>
                  <Link href={`/dashboard/support?page=1&tab=resolved${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                    Resolved
                  </Link>
                </TabsTrigger>
              </TabsList>

              <form className="flex items-center gap-2" action="/dashboard/support">
                <input type="hidden" name="tab" value={tab} />
                <input type="hidden" name="page" value="1" />
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    name="search"
                    placeholder="Search tickets..."
                    className="w-[200px] pl-8"
                    defaultValue={search}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
              </form>
            </div>

            <TabsContent value="all">
              <TicketTable tickets={tickets as Ticket[]} />
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {tickets.length} of {pagination.total} tickets
                </p>
                {/* <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    asChild
                  >
                    <Link href={`/dashboard/support?page=${pagination.page - 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Previous
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    asChild
                  >
                    <Link href={`/dashboard/support?page=${pagination.page + 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Next
                    </Link>
                  </Button>
                </div> */}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    asChild
                    className={`border-none text-white ${pagination.page === 1
                        ? 'bg-gradient-to-r from-purple-300 to-pink-300 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                  >
                    <Link
                      href={`/dashboard/support?page=${pagination.page - 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    >
                      Previous
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    asChild
                    className={`border-none text-white ${pagination.page === pagination.totalPages
                        ? 'bg-gradient-to-r from-green-300 to-blue-300 opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      }`}
                  >
                    <Link
                      href={`/dashboard/support?page=${pagination.page + 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    >
                      Next
                    </Link>
                  </Button>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="open">
              <TicketTable tickets={tickets} />
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {tickets.length} of {stats.openTickets} open tickets
                </p>
                {/* <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    asChild
                  >
                    <Link href={`/dashboard/support?page=${pagination.page - 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Previous
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    asChild
                  >
                    <Link href={`/dashboard/support?page=${pagination.page + 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Next
                    </Link>
                  </Button>
                </div> */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    asChild
                    className={`border-none text-white ${pagination.page === 1
                      ? 'bg-gradient-to-r from-purple-300 to-pink-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                  >
                    <Link
                      href={`/dashboard/support?page=${pagination.page - 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    >
                      Previous
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    asChild
                    className={`border-none text-white ${pagination.page === pagination.totalPages
                      ? 'bg-gradient-to-r from-green-300 to-blue-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      }`}
                  >
                    <Link
                      href={`/dashboard/support?page=${pagination.page + 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    >
                      Next
                    </Link>
                  </Button>
                </div>

              </div>
            </TabsContent>

            <TabsContent value="resolved">
              <TicketTable tickets={tickets} showResolvedDate />
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {tickets.length} of {stats.resolvedTickets} resolved tickets
                </p>
                {/* <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    asChild
                  >
                    <Link href={`/dashboard/support?page=${pagination.page - 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Previous
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    asChild
                  >
                    <Link href={`/dashboard/support?page=${pagination.page + 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}>
                      Next
                    </Link>
                  </Button>
                </div> */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === 1}
                    asChild
                    className={`border-none text-white ${pagination.page === 1
                      ? 'bg-gradient-to-r from-purple-300 to-pink-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                  >
                    <Link
                      href={`/dashboard/support?page=${pagination.page - 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
                    >
                      Previous
                    </Link>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pagination.page === pagination.totalPages}
                    asChild
                    className={`border-none text-white ${pagination.page === pagination.totalPages
                      ? 'bg-gradient-to-r from-green-300 to-blue-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      }`}
                  >
                    <Link
                      href={`/dashboard/support?page=${pagination.page + 1}&tab=${tab}${search ? `&search=${encodeURIComponent(search)}` : ''}`}
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