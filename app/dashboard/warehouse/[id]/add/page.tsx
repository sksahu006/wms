'use client'

import { use, useState } from "react"
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
import { SpaceStatus, SpaceType } from "@prisma/client"
import { createSpace } from "@/app/actions/spaceActions/spaceActions"

export default function AddWarehouseSpacePage({ params }: { params: { id: string } }) {
  const { id } = use(params);
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [features, setFeatures] = useState<string[]>([])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const images = formData.getAll('images') as File[]

    try {
      const result = await createSpace({
        warehouseId: id,
        spaceCode: formData.get('spaceCode') as string,
        name: formData.get('spaceName') as string,
        type: formData.get('spaceType') as SpaceType,
        size: parseFloat(formData.get('size') as string),
        height: parseFloat(formData.get('height') as string),
        location: formData.get('location') as string,
        rate: parseFloat(formData.get('rate') as string) || undefined,
        description: formData.get('description') as string || undefined,
        status: formData.get('status') as SpaceStatus,
        features: features,
        images: images.length > 0 ? images.map((image) => image.name) : [],
      })

      if (result.success) {
        toast({
          title: "Space Added",
          description: "The warehouse space has been added successfully.",
        })
        router.push(`/dashboard/warehouse/${params.id}`)
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to add space",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeatureToggle = (featureName: string, checked: boolean) => {
    if (checked) {
      setFeatures(prev => [...prev, featureName])
    } else {
      setFeatures(prev => prev.filter(f => f !== featureName))
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/warehouse/${id}`}>
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
                <Label htmlFor="spaceCode">Space Code</Label>
                <Input
                  id="spaceCode"
                  name="spaceCode"
                  placeholder="WH-X-000"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spaceName">Space Name</Label>
                <Input
                  id="spaceName"
                  name="spaceName"
                  placeholder="Storage Unit X-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spaceType">Space Type</Label>
                <Select name="spaceType" required>
                  <SelectTrigger id="spaceType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">Regular Storage</SelectItem>
                    <SelectItem value="COLD">Cold Storage</SelectItem>
                    <SelectItem value="HAZARDOUS">Hazardous Materials</SelectItem>
                    <SelectItem value="OUTDOOR">Outdoor Storage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" defaultValue="AVAILABLE" required>
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AVAILABLE">Available</SelectItem>
                    <SelectItem value="OCCUPIED">Occupied</SelectItem>
                    <SelectItem value="MAINTENANCE">Under Maintenance</SelectItem>
                    <SelectItem value="RESERVED">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  name="size"
                  type="number"
                  placeholder="500"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (ft)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  placeholder="10"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Building A, Floor 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Monthly Rate (₹)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  placeholder="1000"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the space"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {[
                  'Climate Control',
                  '24/7 Security',
                  'Loading Dock Access',
                  'Power Outlets',
                  'Shelving Included',
                  'Fire Suppression'
                ].map(feature => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Switch
                      id={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}
                      onCheckedChange={(checked) => handleFeatureToggle(feature, checked)}
                    />
                    <Label htmlFor={`feature-${feature.toLowerCase().replace(/\s+/g, '-')}`}>
                      {feature}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Images</Label>
              <Input
                name="images"
                type="file"
                multiple
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Upload images of the warehouse space (optional)
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/warehouse/${id}`}>
                Cancel
              </Link>
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