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
import { getClientDetails } from "@/app/actions/clientActions/customer"
import { ClientTabs } from "./clientTabs"

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {

  const { success, client, error } = await getClientDetails(params?.id);


  return (
    <div className="flex flex-col gap-4">
      {/* <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Client Details</h1>
        <Button variant="outline" size="sm" className="ml-auto" asChild>
          <Link href={`/dashboard/clients/${params?.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Client
          </Link>
        </Button>
      </div> */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 border-none"
        >
          <Link href="/dashboard/clients">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>

        <h1 className="text-2xl font-bold tracking-tight">Client Details</h1>

        <Button
          variant="outline"
          size="sm"
          className="ml-auto bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 border-none"
          asChild
        >
          <Link href={`/dashboard/clients/${params?.id}/edit`}>
            <Edit className="mr-2 h-4 w-4 text-white" />
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
                  client?.status === "ACTIVE"
                    ? "default"
                    : client?.status === "PENDING"
                      ? "outline"
                      : "secondary"
                }
                className={
                  client?.status === "ACTIVE"
                    ? "bg-green-500"
                    : client?.status === "PENDING"
                      ? "border-yellow-500 text-yellow-500"
                      : ""
                }
              >
                {client?.status}
              </Badge>
            </div>
            <CardDescription className="uppercase">
              Vendor Code: {(client?.id)?.slice(-10)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Building2 className="mr-2 h-4 w-4 text-gray-600" />
                <span className="font-medium">{client?.companyName}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-gray-600" />
                <span>{client?.contact}</span>
                <span className="text-gray-600 ml-1">({client?.position})</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-gray-600" />
                <span>{client?.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-gray-600" />
                <span>{client?.phone}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-600 shrink-0 mt-0.5" />
                <span>{client?.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-600" />
                <span>Joined: {client?.joinedDate}</span>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Business Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-600">Business Type:</span>
                  <p>{client?.businessType}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tax ID:</span>
                  <p>{client?.taxId}</p>
                </div>
              </div>
            </div>

            {client?.requirements && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <p className="text-sm">{client.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Client Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ClientTabs clientId={params?.id} />
          </CardContent>
        </Card>

        {/* <Card className="md:col-span-4">
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
                          <TableCell colSpan={5} className="text-center py-4 text-gray-600">
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
                          <TableCell colSpan={6} className="text-center py-4 text-gray-600">
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
                          <TableCell colSpan={6} className="text-center py-4 text-gray-600">
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
                          <TableCell colSpan={6} className="text-center py-4 text-gray-600">
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
        </Card> */}
      </div>
    </div>
  )
}
