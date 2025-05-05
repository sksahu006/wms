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
import { createSupportTicket } from "@/app/actions/support/supportAction"
import { getSpaces } from "@/app/actions/clientActions/customer"
import { SearchableCombobox } from "@/components/ui/SearchableCombobox"
import { useSession } from "next-auth/react"

export default function NewSupportTicketPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [spaceId, setSpaceId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const session = useSession()

  const fetchSpaces = async (search: string) => {
    const spacesResult = await getSpaces({ page: 1, pageSize: 10, search,clientId: session.data?.user.id })
    if (spacesResult.success) {
      return spacesResult.data.map((space) => ({
        id: space.id,
        label: space.spaceCode || space.name || space.id,
      }))
    }
    return []
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)

    // Append selected spaceId manually
    if (spaceId) {
      formData.append("spaceId", spaceId)
    }

    try {
      const response = await createSupportTicket(formData)

      if (response.success) {
        toast({
          title: "Ticket Created",
          description: "Your support ticket has been created successfully.",
        })
        router.push("/dashboard/support")
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to create ticket",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/support">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Create Support Ticket</h1>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Ticket Information</CardTitle>
            <CardDescription>
              Provide details about your issue or request
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Ticket Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="access">Access Issues</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spaceId">Space</Label>
                <SearchableCombobox
                  value={spaceId}
                  onValueChange={setSpaceId}
                  placeholder="Select a space"
                  searchPlaceholder="Search spaces..."
                  fetchData={fetchSpaces}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="description">Detailed Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Please provide a detailed description of your issue or request"
                className="min-h-[150px]"
                required
              />
            </div>

            <div className="space-y-2">

              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" required>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="attachments">Attachments (Optional)</Label>
              <Input
                id="attachments"
                name="attachments"
                type="file"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">Upload any relevant files or images</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href="/dashboard/support">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Ticket"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
