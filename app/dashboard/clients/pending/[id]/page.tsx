"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Calendar, CheckCircle2, Download, FileText, Mail, MapPin, Phone, User, XCircle, Clock } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export default function PendingClientDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)

  // In a real app, you would fetch client data based on the ID
  const client = {
    id: params.id,
    name: "Global Logistics",
    contact: "Robert Johnson",
    position: "Operations Director",
    email: "robert@globallogistics.com",
    phone: "+1 (555) 456-7890",
    address: "456 Logistics Blvd, Suite 200, Chicago, IL 60601",
    status: "Pending",
    businessType: "Distribution",
    taxId: "TAX-87654321",
    submittedDate: "Mar 10, 2023",
    requirements: "Need approximately 1000 sq ft of storage space for inventory. Looking for a 12-month lease with option to extend.",
    documents: [
      { name: "Business License", file: "business-license.pdf" },
      { name: "Tax Certificate", file: "tax-certificate.pdf" },
      { name: "Insurance Certificate", file: "insurance.pdf" },
    ]
  }

  const handleApprove = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Client Approved",
        description: "The client has been approved successfully.",
      })
      router.push("/dashboard/clients/pending")
    }, 1500)
  }

  const handleReject = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsRejectDialogOpen(false)
      toast({
        title: "Client Rejected",
        description: "The client registration has been rejected.",
      })
      router.push("/dashboard/clients/pending")
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/clients/pending">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Pending Client Details</h1>
        <div className="ml-auto space-x-2">
          <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="text-red-600">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reject Client Registration</DialogTitle>
                <DialogDescription>
                  Please provide a reason for rejecting this client registration. This will be sent to the client.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Textarea
                  placeholder="Enter rejection reason"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              {/* <DialogFooter>
                <Button variant="outline" onClick={() => setIsRejectDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleReject} 
                  disabled={isLoading || !rejectReason.trim()}
                >
                  {isLoading ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </DialogFooter> */}
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsRejectDialogOpen(false)}
                  className="border-none text-white bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600"
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={isLoading || !rejectReason.trim()}
                  className={`border-none text-white ${isLoading || !rejectReason.trim()
                      ? 'bg-gradient-to-r from-red-300 to-red-500 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-700 hover:to-red-900'
                    }`}
                >
                  {isLoading ? "Rejecting..." : "Confirm Rejection"}
                </Button>
              </DialogFooter>

            </DialogContent>
          </Dialog>

          <Button onClick={handleApprove} disabled={isLoading}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {isLoading ? "Approving..." : "Approve Client"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Client Information</CardTitle>
              <Badge
                variant="outline"
                className="border-yellow-500 text-yellow-500"
              >
                <Clock className="mr-1 h-3 w-3" />
                {client.status}
              </Badge>
            </div>
            <CardDescription>
              Registration ID: {client.id}
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
                <span>Submitted: {client.submittedDate}</span>
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

            {client.requirements && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Storage Requirements</h3>
                <p className="text-sm">{client.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Registration Documents</CardTitle>
            <CardDescription>
              Review submitted documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="documents">
                <div className="space-y-4">
                  {client.documents.map((doc, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <span>{doc.name}</span>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="verification">
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Verification Checklist</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-business" className="mr-2" />
                        <label htmlFor="verify-business" className="text-sm">Business license is valid</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-tax" className="mr-2" />
                        <label htmlFor="verify-tax" className="text-sm">Tax ID is verified</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-address" className="mr-2" />
                        <label htmlFor="verify-address" className="text-sm">Business address is confirmed</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-contact" className="mr-2" />
                        <label htmlFor="verify-contact" className="text-sm">Contact information is valid</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-insurance" className="mr-2" />
                        <label htmlFor="verify-insurance" className="text-sm">Insurance requirements met</label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <Textarea
                      placeholder="Add verification notes here..."
                      className="min-h-[100px]"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/clients/pending">Back to List</Link>
            </Button>
            <div className="space-x-2">
              <Button variant="outline" className="text-red-600" onClick={() => setIsRejectDialogOpen(true)}>
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={isLoading}>
                {isLoading ? "Approving..." : "Approve"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
