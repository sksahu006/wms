"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
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
import { registerUser } from "@/app/actions/clientActions/customer"


export default function AddClientPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [businessType, setBusinessType] = useState("")
  const [status, setStatus] = useState("active")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("businessType", businessType)
    formData.set("status", status)

    const result = await registerUser(formData)
    setIsLoading(false)

    if (result.success) {
      toast({
        title: "Client Added",
        description: result.message,
      })
      router.push("/dashboard/clients")
    } else {
      toast({
        title: "Error",
        description: result.error || "Something went wrong.",
        variant: "destructive",
      })
    }
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
        <h1 className="text-2xl font-bold tracking-tight">Add New Client</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>
              Add a new client to the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
               className="placeholder:text-gray-500 shadow-md"
                id="companyName"
                name="companyName"
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="contactName"
                  name="contactName"
                  placeholder="Full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="position"
                  name="position"
                  placeholder="Job title"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@company.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="phone"
                  name="phone"
                  placeholder="+1 (555) 123-4567"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea
                className="placeholder:text-gray-500 shadow-md"
                id="address"
                name="address"
                placeholder="Enter business address"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select onValueChange={setBusinessType} required>
                  <SelectTrigger id="businessType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="text-gray-900">
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="distribution">Distribution</SelectItem>
                    <SelectItem value="ecommerce">E-Commerce</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / Business Number</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="taxId"
                  name="taxId"
                  placeholder="Enter tax ID"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="Special requests, delivery instructions, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                className="placeholder:text-gray-500 shadow-md"
                id="password"
                name="password"
                type="password"
                placeholder="Enter a secure password"
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Switch id="sendCredentials" />
              <Label htmlFor="sendCredentials">
                Send login credentials to client email
              </Label>
            </div>
          </CardContent>

          {/* <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/clients">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adding..." : "Add Client"}
            </Button>
          </CardFooter> */}

          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              asChild
              className="border-none text-white bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600"
            >
              <Link href="/dashboard/clients">Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className={`border-none text-white ${isLoading
                  ? 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
                }`}
            >
              {isLoading ? "Adding..." : "Add Client"}
            </Button>
          </CardFooter>

        </form>
      </Card>
    </div>
  )
}
