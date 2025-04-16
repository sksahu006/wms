import Link from "next/link"
import { ArrowLeft, Building2, Calendar, Edit, FileText, Mail, MapPin, Phone, User } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  // In a real app, you would fetch client data based on the ID
  const client = {
    id: params.id,
    name: "Acme Corporation",
    contact: "John Doe",
    position: "Procurement Manager",
    email: "john@acmecorp.com",
    phone: "+1 (555) 123-4567",
    address: "123 Business Ave, Suite 100, San Francisco, CA 94107",
    status: "Active",
    businessType: "Manufacturing",
    taxId: "TAX-12345678",
    joinedDate: "Jan 15, 2023",
    notes: "Key client with multiple storage requirements. Prefers quarterly billing.",
    spaces: [
      {
        id: "WH-A-101",
        name: "Storage Unit A-101",
        type: "Regular",
        size: "500 sq ft",
        status: "Occupied",
        startDate: "Jan 15, 2023",
        endDate: "Dec 31, 2023",
      }
    ],
    invoices: [
      {
        id: "INV-001",
        amount: "₹,200.00",
        date: "Jan 15, 2023",
        dueDate: "Feb 15, 2023",
        status: "Paid",
        period: "Jan 2023",
      },
      {
        id: "INV-005",
        amount: "₹,200.00",
        date: "Feb 15, 2023",
        dueDate: "Mar 15, 2023",
        status: "Paid",
        period: "Feb 2023",
      }
    ],
    agreements: [
      {
        id: "AGR-001",
        title: "Warehouse Rental Agreement - Unit A-101",
        date: "Jan 15, 2023",
        status: "Active",
        expiryDate: "Dec 31, 2023",
      }
    ],
    supportTickets: [
      {
        id: "TKT-001",
        title: "Request for additional security",
        date: "Feb 10, 2023",
        status: "Resolved",
        priority: "Medium",
      }
    ]
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Client Details</h1>
        <Button variant="outline" size="sm" className="ml-auto" asChild>
          <Link href={`/dashboard/clients/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Client Information</CardTitle>
              <Badge
                variant={
                  client.status === "Active"
                    ? "default"
                    : client.status === "Pending"
                    ? "outline"
                    : "secondary"
                }
                className={
                  client.status === "Active"
                    ? "bg-green-500"
                    : client.status === "Pending"
                    ? "border-yellow-500 text-yellow-500"
                    : ""
                }
              >
                {client.status}
              </Badge>
            </div>
            <CardDescription>
              Vendor Code: {client.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{client.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.contact}</span>
                <span className="text-muted-foreground ml-1">({client.position})</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{client.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>Joined: {client.joinedDate}</span>
              </div>
            </div>
            
            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Business Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Business Type:</span>
                  <p>{client.businessType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tax ID:</span>
                  <p>{client.taxId}</p>
                </div>
              </div>
            </div>
            
            {client.notes && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <p className="text-sm">{client.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Client Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="spaces" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="spaces">Spaces</TabsTrigger>
                <TabsTrigger value="invoices">Invoices</TabsTrigger>
                <TabsTrigger value="agreements">Agreements</TabsTrigger>
                <TabsTrigger value="support">Support</TabsTrigger>
              </TabsList>
              
              <TabsContent value="spaces">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Space ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Lease Period</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.spaces.length > 0 ? (
                        client.spaces.map((space) => (
                          <TableRow key={space.id}>
                            <TableCell className="font-medium">{space.id}</TableCell>
                            <TableCell>{space.name}</TableCell>
                            <TableCell>{space.type}</TableCell>
                            <TableCell>{space.size}</TableCell>
                            <TableCell>
                              {space.startDate} - {space.endDate}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No spaces allocated
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="invoices">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.invoices.length > 0 ? (
                        client.invoices.map((invoice) => (
                          <TableRow key={invoice.id}>
                            <TableCell className="font-medium">{invoice.id}</TableCell>
                            <TableCell>{invoice.amount}</TableCell>
                            <TableCell>{invoice.date}</TableCell>
                            <TableCell>{invoice.dueDate}</TableCell>
                            <TableCell>
                              <Badge
                                variant={invoice.status === "Paid" ? "default" : "outline"}
                                className={invoice.status === "Paid" ? "bg-green-500" : ""}
                              >
                                {invoice.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/invoices/${invoice.id}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
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
                </div>
              </TabsContent>
              
              <TabsContent value="agreements">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agreement ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Expiry</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.agreements.length > 0 ? (
                        client.agreements.map((agreement) => (
                          <TableRow key={agreement.id}>
                            <TableCell className="font-medium">{agreement.id}</TableCell>
                            <TableCell>{agreement.title}</TableCell>
                            <TableCell>{agreement.date}</TableCell>
                            <TableCell>{agreement.expiryDate}</TableCell>
                            <TableCell>
                              <Badge
                                variant={agreement.status === "Active" ? "default" : "outline"}
                                className={agreement.status === "Active" ? "bg-green-500" : ""}
                              >
                                {agreement.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/agreements/${agreement.id}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No agreements found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              
              <TabsContent value="support">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ticket ID</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {client.supportTickets.length > 0 ? (
                        client.supportTickets.map((ticket) => (
                          <TableRow key={ticket.id}>
                            <TableCell className="font-medium">{ticket.id}</TableCell>
                            <TableCell>{ticket.title}</TableCell>
                            <TableCell>{ticket.date}</TableCell>
                            <TableCell>{ticket.priority}</TableCell>
                            <TableCell>
                              <Badge
                                variant={ticket.status === "Resolved" ? "default" : "outline"}
                                className={ticket.status === "Resolved" ? "bg-green-500" : ""}
                              >
                                {ticket.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/dashboard/support/${ticket.id}`}>
                                  <FileText className="mr-2 h-4 w-4" />
                                  View
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No support tickets found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
