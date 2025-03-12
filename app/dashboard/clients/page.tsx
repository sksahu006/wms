import Link from "next/link"
import { CheckCircle2, Clock, Download, MoreHorizontal, Plus, Search, SlidersHorizontal, XCircle } from "lucide-react"

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

export default function ClientsPage() {
  const clients = [
    {
      id: "WMS001",
      name: "Acme Corporation",
      contact: "John Doe",
      email: "john@acmecorp.com",
      phone: "+1 (555) 123-4567",
      status: "Active",
      spaces: 3,
      joinedDate: "Jan 15, 2023",
    },
    {
      id: "WMS002",
      name: "TechSolutions Inc",
      contact: "Jane Smith",
      email: "jane@techsolutions.com",
      phone: "+1 (555) 987-6543",
      status: "Active",
      spaces: 2,
      joinedDate: "Feb 22, 2023",
    },
    {
      id: "WMS003",
      name: "Global Logistics",
      contact: "Robert Johnson",
      email: "robert@globallogistics.com",
      phone: "+1 (555) 456-7890",
      status: "Pending",
      spaces: 0,
      joinedDate: "Mar 10, 2023",
    },
    {
      id: "WMS004",
      name: "Retail Enterprises",
      contact: "Sarah Williams",
      email: "sarah@retailent.com",
      phone: "+1 (555) 789-0123",
      status: "Inactive",
      spaces: 1,
      joinedDate: "Apr 5, 2023",
    },
    {
      id: "WMS005",
      name: "Manufacturing Pro",
      contact: "Michael Brown",
      email: "michael@manufacturingpro.com",
      phone: "+1 (555) 234-5678",
      status: "Active",
      spaces: 5,
      joinedDate: "May 18, 2023",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Button className="flex">
          <Link href="/dashboard/clients/add">
            {/* <Plus className="mr-2 h-4 w-4" />  */}
            Add Client
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Management</CardTitle>
          <CardDescription>View and manage all registered clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search clients..." className="w-full pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Download</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Spaces</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.id}</TableCell>
                    <TableCell>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.email}</div>
                    </TableCell>
                    <TableCell>
                      <div>{client.contact}</div>
                      <div className="text-sm text-muted-foreground">{client.phone}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          client.status === "Active" ? "default" : client.status === "Pending" ? "outline" : "secondary"
                        }
                        className={
                          client.status === "Active"
                            ? "bg-green-500"
                            : client.status === "Pending"
                              ? "border-yellow-500 text-yellow-500"
                              : ""
                        }
                      >
                        {client.status === "Active" && <CheckCircle2 className="mr-1 h-3 w-3" />}
                        {client.status === "Pending" && <Clock className="mr-1 h-3 w-3" />}
                        {client.status === "Inactive" && <XCircle className="mr-1 h-3 w-3" />}
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.spaces}</TableCell>
                    <TableCell>{client.joinedDate}</TableCell>
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
                          <DropdownMenuItem>
                            <Link href={`/dashboard/clients/${client.id}`} className="flex w-full">
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>Edit client</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>View invoices</DropdownMenuItem>
                          <DropdownMenuItem>View agreements</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {client.status === "Pending" ? (
                            <DropdownMenuItem className="text-green-600">Approve client</DropdownMenuItem>
                          ) : client.status === "Active" ? (
                            <DropdownMenuItem className="text-yellow-600">Deactivate client</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">Activate client</DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

