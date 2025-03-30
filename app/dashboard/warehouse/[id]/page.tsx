"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Calendar, Edit, FileText, MapPin, Package, Ruler, Snowflake } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { use } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"

export default function WarehouseSpaceDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false)
  const { id } = use(params);
  // In a real app, you would fetch space data based on the ID
  const space = {
    id,
    name: "Storage Unit A-101",
    type: "Regular",
    size: "500 sq ft",
    height: "10 ft",
    location: "Building A, Floor 1",
    image: "https://img.freepik.com/free-photo/view-inside-new-warehouse-mezzanine-floor-looking-into-hall_181624-25949.jpg?uid=R160018945&ga=GA1.1.1155705999.1735793162&semt=ais_hybrid",
    status: "Vacant",
    rate: "$1,200.00/month",
    description: "Clean, well-maintained storage unit with easy access. Suitable for general merchandise storage.",
    features: ["Climate Control", "24/7 Security", "Loading Dock Access", "Fire Suppression"],
    utilization: 0,
    client: null,
    clientId: null,
    expiryDate: null,
    history: [
      {
        date: "Jan 1, 2023",
        event: "Space added to inventory",
        user: "Admin User",
      },
      {
        date: "Jan 5, 2023 - Mar 15, 2023",
        event: "Occupied by TechSolutions Inc",
        user: "Admin User",
      },
      {
        date: "Mar 16, 2023",
        event: "Maintenance performed",
        user: "Maintenance Staff",
      },
      {
        date: "Mar 20, 2023",
        event: "Space marked as vacant",
        user: "Admin User",
      }
    ]
  }

  const clients = [
    { id: "WMS001", name: "Acme Corporation" },
    { id: "WMS002", name: "TechSolutions Inc" },
    { id: "WMS004", name: "Retail Enterprises" },
    { id: "WMS005", name: "Manufacturing Pro" },
  ]

  const handleAllocate = () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      setIsAllocateDialogOpen(false)
      toast({
        title: "Space Allocated",
        description: "The warehouse space has been allocated successfully.",
      })
      router.push("/dashboard/warehouse")
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/warehouse">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Space Details</h1>
        <div className="ml-auto space-x-2">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/warehouse/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Space
            </Link>
          </Button>

          {space.status === "Vacant" && (
            <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
              <DialogTrigger asChild>
                <Button>Allocate Space</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Allocate Warehouse Space</DialogTitle>
                  <DialogDescription>
                    Assign this space to a client and set lease terms.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Select Client</Label>
                    <Select required>
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} ({client.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <input
                        type="date"
                        id="startDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <input
                        type="date"
                        id="endDate"
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rate">Monthly Rate ($)</Label>
                    <input
                      type="number"
                      id="rate"
                      defaultValue="1200"
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes about this allocation"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAllocateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAllocate} disabled={isLoading}>
                    {isLoading ? "Allocating..." : "Allocate Space"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Space Information</CardTitle>
              <Badge
                variant={
                  space.status === "Occupied"
                    ? "default"
                    : space.status === "Vacant"
                      ? "outline"
                      : "secondary"
                }
                className={
                  space.status === "Occupied"
                    ? "bg-green-500"
                    : space.status === "Vacant"
                      ? "border-blue-500 text-blue-500"
                      : ""
                }
              >
                {space.status}
              </Badge>
            </div>
            <CardDescription>
              ID: {space.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center gap-4 p-4 border rounded-lg">
              <div className="space-y-2 max-w-[60%]">
                <div className="flex items-center text-sm">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{space.name}</span>
                </div>
                <div className="flex items-center text-sm">
                  {space.type === "Cold Storage" ? (
                    <Snowflake className="mr-2 h-4 w-4 text-blue-500" />
                  ) : (
                    <Package className="mr-2 h-4 w-4 text-muted-foreground" />
                  )}
                  <span>{space.type} Storage</span>
                </div>
                <div className="flex items-center text-sm">
                  <Ruler className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{space.size} (Height: {space.height})</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{space.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Rate: {space.rate}</span>
                </div>
              </div>

              <div className="flex-shrink-0">
                <Image
                  src={space.image}
                  alt={space.name}
                  width={200}
                  height={200}
                  className="w-[200px] h-[200px] object-cover rounded-md"
                />
              </div>
            </div>
            {space.client && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Current Tenant</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">{space.client}</span> ({space.clientId})
                  </p>
                  <p>Expires: {space.expiryDate}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs">Utilization:</span>
                    <Progress value={space.utilization} className="h-2 w-[100px]" />
                    <span className="text-xs">{space.utilization}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Description</h3>
              <p className="text-sm">{space.description}</p>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {space.features.map((feature, index) => (
                  <Badge key={index} variant="outline">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Space Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="history" className="space-y-4">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
              </TabsList>

              <TabsContent value="history">
                <div className="space-y-4">
                  {space.history.map((item, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0 last:pb-0">
                      <div className="w-1/3 text-sm text-muted-foreground">
                        {item.date}
                      </div>
                      <div className="w-2/3">
                        <p className="text-sm font-medium">{item.event}</p>
                        <p className="text-xs text-muted-foreground">By: {item.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="documents">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No Documents</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    There are no documents associated with this space yet.
                  </p>
                  <Button className="mt-4">Upload Document</Button>
                </div>
              </TabsContent>

              <TabsContent value="maintenance">
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Building2 className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Maintenance Records</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    No maintenance records found for this space.
                  </p>
                  <Button className="mt-4">Schedule Maintenance</Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/dashboard/warehouse">Back to List</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
