"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Building2, Calendar, MapPin, Package, Ruler, Snowflake } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function RequestSpacePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  // In a real app, you would fetch space data based on the ID
  const space = {
    id: params.id,
    name: params.id === "WH-B-202" 
      ? "Storage Unit B-202" 
      : "Storage Unit C-302",
    type: params.id === "WH-B-202" 
      ? "Cold Storage" 
      : "Regular",
    size: params.id === "WH-B-202" 
      ? "300 sq ft" 
      : "1000 sq ft",
    height: "10 ft",
    location: params.id === "WH-B-202" 
      ? "Building B, Floor 2" 
      : "Building C, Floor 3",
    monthlyRate: params.id === "WH-B-202" 
      ? "₹1,500.00" 
      : "₹2,000.00",
    description: params.id === "WH-B-202"
      ? "Temperature-controlled storage unit suitable for perishable goods. Maintains temperatures between 35-40°F."
      : "Large storage unit with high ceilings, suitable for bulk storage. Easy access to loading docks.",
    features: params.id === "WH-B-202"
      ? ["Temperature Control", "24/7 Security", "Loading Dock Access", "Fire Suppression"]
      : ["24/7 Security", "Loading Dock Access", "High Ceilings", "Fire Suppression", "Shelving Available"]
  }
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Request Submitted",
        description: "Your space request has been submitted successfully.",
      })
      router.push("/dashboard/spaces")
    }, 1500)
  }
  
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/spaces">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Request Space</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Space Information</CardTitle>
              <Badge
                variant="outline"
                className={
                  space.type === "Cold Storage"
                    ? "border-blue-500 text-blue-500"
                    : "border-green-500 text-green-500"
                }
              >
                {space.type}
              </Badge>
            </div>
            <CardDescription>
              ID: {space.id}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
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
                <span>Rate: {space.monthlyRate}/month</span>
              </div>
            </div>
            
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
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
              <CardDescription>
                Provide details for your space request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Requested Start Date</Label>
                  <input 
                    type="date" 
                    id="startDate" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration">Lease Duration</Label>
                  <Select required>
                    <SelectTrigger id="duration">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 months</SelectItem>
                      <SelectItem value="6">6 months</SelectItem>
                      <SelectItem value="12">12 months</SelectItem>
                      <SelectItem value="24">24 months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="purpose">Storage Purpose</Label>
                <Select required>
                  <SelectTrigger id="purpose">
                    <SelectValue placeholder="Select purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inventory">Inventory Storage</SelectItem>
                    <SelectItem value="equipment">Equipment Storage</SelectItem>
                    <SelectItem value="documents">Document Storage</SelectItem>
                    <SelectItem value="perishable">Perishable Goods</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="requirements">Special Requirements</Label>
                <Textarea 
                  id="requirements" 
                  placeholder="Any special requirements or modifications needed for the space"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  placeholder="Any additional information about your request"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/dashboard/spaces">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Request"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
