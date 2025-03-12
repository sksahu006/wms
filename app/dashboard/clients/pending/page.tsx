import Link from "next/link"
import { CheckCircle2, Clock, MoreHorizontal, Search, SlidersHorizontal, XCircle } from 'lucide-react'

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

export default function PendingClientsPage() {
  const pendingClients = [
    {
      id: "WMS006",
      name: "Global Logistics",
      contact: "Robert Johnson",
      email: "robert@globallogistics.com",
      phone: "+1 (555) 456-7890",
      status: "Pending",
      submittedDate: "Mar 10, 2023",
    },
    {
      id: "WMS007",
      name: "EcoStorage Solutions",
      contact: "Emily Chen",
      email: "emily@ecostorage.com",
      phone: "+1 (555) 987-6543",
      status: "Pending",
      submittedDate: "Apr 5, 2023",
    },
    {
      id: "WMS008",
      name: "FastTrack Shipping",
      contact: "David Wilson",
      email: "david@fasttrack.com",
      phone: "+1 (555) 234-5678",
      status: "Pending",
      submittedDate: "Apr 12, 2023",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Client Registration Requests</CardTitle>
          <CardDescription>
            Review and approve pending client registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pending clients..."
                  className="w-full pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filter</span>
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
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingClients.map((client) => (
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
                        variant="outline"
                        className="border-yellow-500 text-yellow-500"
                      >
                        <Clock className="mr-1 h-3 w-3" />
                        {client.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{client.submittedDate}</TableCell>
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
                            <Link href={`/dashboard/clients/pending/${client.id}`}>
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-green-600">
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <XCircle className="mr-2 h-4 w-4" />
                            Reject
                          </DropdownMenuItem>
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
