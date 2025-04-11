"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Switch } from "@/components/ui/switch"

export default function AddWarehouseSpacePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Space Added",
        description: "The warehouse space has been added successfully.",
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
        <h1 className="text-2xl font-bold tracking-tight">Add Warehouse Space</h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Space Information</CardTitle>
            <CardDescription>
              Add a new warehouse space to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spaceId">Space ID</Label>
                <Input id="spaceId" placeholder="WH-X-000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spaceName">Space Name</Label>
                <Input id="spaceName" placeholder="Storage Unit X-000" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spaceType">Space Type</Label>
                <Select required>
                  <SelectTrigger id="spaceType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular Storage</SelectItem>
                    <SelectItem value="cold">Cold Storage</SelectItem>
                    <SelectItem value="hazardous">Hazardous Materials</SelectItem>
                    <SelectItem value="outdoor">Outdoor Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select defaultValue="vacant" required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacant">Vacant</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Under Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input id="size" type="number" placeholder="500" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (ft)</Label>
                <Input id="height" type="number" placeholder="10" required />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="Building A, Floor 1" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Monthly Rate (₹)</Label>
                <Input id="rate" type="number" placeholder="1000" required />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Detailed description of the space"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch id="feature-climate" />
                  <Label htmlFor="feature-climate">Climate Control</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="feature-security" />
                  <Label htmlFor="feature-security">24/7 Security</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="feature-loading" />
                  <Label htmlFor="feature-loading">Loading Dock Access</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="feature-power" />
                  <Label htmlFor="feature-power">Power Outlets</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="feature-shelving" />
                  <Label htmlFor="feature-shelving">Shelving Included</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="feature-fire" />
                  <Label htmlFor="feature-fire">Fire Suppression</Label>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Images</Label>
              <Input type="file" multiple className="cursor-pointer" />
              <p className="text-xs text-muted-foreground">Upload images of the warehouse space (optional)</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/warehouse">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Space"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
