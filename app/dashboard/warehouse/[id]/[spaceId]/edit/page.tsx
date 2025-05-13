'use client'

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
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
import { updateSpace, getSpaceById } from "@/app/actions/spaceActions/spaceActions"
import { handleFileUpload } from "@/lib/handleFileUpload"
type Params = {
  id: string;
  spaceId: string;
};

export default function WarehouseSpaceFormPage() {
  const { id, spaceId } = useParams() as Params;
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [features, setFeatures] = useState<string[]>([])
  const [spaceData, setSpaceData] = useState<any | null>(null)

  const isEdit = !!spaceId
  useEffect(() => {
    if (isEdit) {
      getSpaceById(spaceId!).then(data => {
        if (data) {
          setSpaceData(data.data)
          setFeatures(data.data?.features || [])
        }
      })
    }
  }, [spaceId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    const images = formData.getAll('images') as File[];

    try {
      // Upload new images to Cloudinary
      const uploadedImageUrls: string[] = [];

      for (const file of images) {
        const imageUrl = await handleFileUpload(file);
        if (imageUrl) {
          uploadedImageUrls.push(imageUrl);
        }
      }

      const payload = {
        warehouseId: id,
        spaceCode: formData.get('spaceCode') as string,
        name: formData.get('spaceName') as string,
        type: formData.get('spaceType') as SpaceType || spaceData?.type,
        size: parseFloat(formData.get('size') as string),
        height: parseFloat(formData.get('height') as string),
        location: formData.get('location') as string,
        rate: parseFloat(formData.get('rate') as string) || undefined,
        description: formData.get('description') as string || undefined,
        status: formData.get('status') as SpaceStatus || spaceData?.status,
        features,
        images:
          uploadedImageUrls.length > 0
            ? uploadedImageUrls
            : spaceData?.images || [],
      };


      const result = await updateSpace({ spaceId: spaceId!, ...payload });

      if (result.success) {
        toast({
          title: isEdit ? "Space Updated" : "Space Added",
          description: `The warehouse space has been ${isEdit ? "updated" : "added"} successfully.`,
        });
        router.push(`/dashboard/warehouse/${id}`);
      } else {
        console.log(result);
        toast({
          variant: "destructive",
          title: "Error",
          description: result.error || "Failed to save space",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFeatureToggle = (featureName: string, checked: boolean) => {
    if (checked) {
      setFeatures(prev => [...prev, featureName])
    } else {
      setFeatures(prev => prev.filter(f => f !== featureName))
    }
  }

  const featureOptions = [
    'Climate Control',
    '24/7 Security',
    'Loading Dock Access',
    'Power Outlets',
    'Shelving Included',
    'Fire Suppression'
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href={`/dashboard/warehouse/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">
          {isEdit ? "Edit" : "Add"} Warehouse Space
        </h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Space Information</CardTitle>
            <CardDescription>
              {isEdit ? "Update the warehouse space details" : "Add a new warehouse space"}
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

                  defaultValue={spaceData?.spaceCode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spaceName">Space Name</Label>
                <Input
                  id="spaceName"
                  name="spaceName"
                  placeholder="Storage Unit X-000"
                  defaultValue={spaceData?.name}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="spaceType">Space Type</Label>
                <Select name="spaceType" defaultValue={spaceData?.type}>
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
              {/* <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status"   defaultValue={spaceData?.status || "AVAILABLE"}>
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
              </div> */}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="size">Size (sq ft)</Label>
                <Input
                  id="size"
                  name="size"
                  type="number"
                  placeholder="500"

                  defaultValue={spaceData?.size}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (ft)</Label>
                <Input
                  id="height"
                  name="height"
                  type="number"
                  placeholder="10"
                  defaultValue={spaceData?.height}
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
                  defaultValue={spaceData?.location}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rate">Monthly Rate (₹)</Label>
                <Input
                  id="rate"
                  name="rate"
                  type="number"
                  placeholder="1000"
                  defaultValue={spaceData?.rate}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description of the space"
                defaultValue={spaceData?.description}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features</Label>
              <div className="grid grid-cols-2 gap-2 pt-2">
                {featureOptions.map(feature => {
                  const featureId = `feature-${feature.toLowerCase().replace(/\s+/g, '-')}`
                  return (
                    <div key={feature} className="flex items-center space-x-2">
                      <Switch
                        id={featureId}
                        checked={features.includes(feature)}
                        onCheckedChange={(checked) => handleFeatureToggle(feature, checked)}
                      />
                      <Label htmlFor={featureId}>{feature}</Label>
                    </div>
                  )
                })}
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
                Upload new images to replace or add to the existing ones (optional)
              </p>
            </div>
          </CardContent>

          {/* <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/warehouse/${id}`}>
                Cancel
              </Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (isEdit ? "Updating..." : "Adding...") : (isEdit ? "Update Space" : "Add Space")}
            </Button>
          </CardFooter> */}
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              asChild
              className="border-none text-white bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700"
            >
              <Link href={`/dashboard/warehouse/${id}`}>
                Cancel
              </Link>
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className={`border-none text-white ${isLoading
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600'
                }`}
            >
              {isLoading
                ? isEdit
                  ? "Updating..."
                  : "Adding..."
                : isEdit
                  ? "Update Space"
                  : "Add Space"}
            </Button>
          </CardFooter>

        </form>
      </Card>
    </div>
  )
}
