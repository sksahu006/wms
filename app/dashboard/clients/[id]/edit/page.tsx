"use client"

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
import { getClientDetails, updateClient } from "@/app/actions/clientActions/customer"
import { ClientDetails } from "@/lib/types"



export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [client, setClient] = useState<ClientDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        const { success, client } = await getClientDetails(id)
        console.log(client)
        if (success) {
          setClient(client)
        } else {
          setError(String(error))
        }
      } catch (error) {
        setError(String(error))
      }
    }

    fetchClientDetails()
  }, [id])
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    // Extract form data
    const formData = new FormData(e.target as HTMLFormElement)
    const updatedClient = {
      id,
      companyName: formData.get("companyName") as string,
      name: formData.get("contactName") as string,
      position: formData.get("position") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      businessType: formData.get("businessType") as string,
      taxId: formData.get("taxId") as string,
      status: formData.get("status") as string,
      requirements: formData.get("notes") as string,
      openingBalance: parseFloat(formData.get("openingBalance") as string) || 0,
      billedAmount: parseFloat(formData.get("billedAmount") as string) || 0,
      receivedAmount: parseFloat(formData.get("receivedAmount") as string) || 0,
      balanceAmount: parseFloat(formData.get("balanceAmount") as string) || 0,
    }

    try {
      console.log(updatedClient)

      const result = await updateClient(updatedClient)
      if (!result.success) {
        toast({
          title: "Update Failed",
          description: "There was an error updating the client details.",
          variant: "destructive",
        })
        throw new Error(result.error)

      }

      toast({
        title: "Client Updated",
        description: "The client information has been updated successfully.",
      })

      router.push(`/dashboard/clients/${id}`)
    } catch (error) {
      console.log(error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the client details.",
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
          <Link href={`/dashboard/clients/${id}`}>
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Edit Client</h1>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
            <CardDescription>Update the details of the client.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input id="companyName" name="companyName" className="shadow-md" defaultValue={client?.companyName ?? ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Contact Person</Label>
                <Input id="contactName" name="contactName" className="shadow-md" defaultValue={client?.contact ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Input id="position" name="position" className="shadow-md" defaultValue={client?.position ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" className="shadow-md" defaultValue={client?.email ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" name="phone" className="shadow-md" defaultValue={client?.phone ?? ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="openingBalance">Opening Balance</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="openingBalance"
                  name="openingBalance"
                  placeholder="Opening balance"
                  type="text"
                  defaultValue={client?.openingBalance ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billedAmount">Billed Amount</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="billedAmount"
                  name="billedAmount"
                  placeholder="Billed amount"
                  type="text"
                  defaultValue={client?.billedAmount ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="receivedAmount">Received Amount</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="receivedAmount"
                  name="receivedAmount"
                  placeholder="Received amount"
                  type="text"
                  defaultValue={client?.receivedAmount ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="balanceAmount">Balance Amount</Label>
                <Input
                  className="placeholder:text-gray-500 shadow-md"
                  id="balanceAmount"
                  name="balanceAmount"
                  placeholder="Balance amount"
                  type="text"
                  defaultValue={client?.balanceAmount ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Business Address</Label>
              <Textarea id="address" name="address" className="shadow-md" defaultValue={client?.address ?? ""} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="businessType">Business Type</Label>
                <Select name="businessType" defaultValue={client?.businessType || "retail"} required>
                  <SelectTrigger>
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
                <Input id="taxId" name="taxId" className="text-gray-900 shadow-md" defaultValue={(client?.taxId) ?? ""} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={client?.status ?? "ACTIVE"} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="text-gray-100">
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                className="shadow-md" defaultValue={client?.requirements ?? ""}
                placeholder="Additional notes about this client"
              />
            </div>
          </CardContent>
          {/* <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" asChild>
              <Link href={`/dashboard/clients/${id}`}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Client"}
            </Button>
          </CardFooter> */}
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              type="button"
              asChild
              className="border-none text-white bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600"
            >
              <Link href={`/dashboard/clients/${id}`}>Cancel</Link>
            </Button>

            <Button
              type="submit"
              disabled={isLoading}
              className={`border-none text-white ${isLoading
                ? 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-50 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600'
                }`}
            >
              {isLoading ? "Updating..." : "Update Client"}
            </Button>
          </CardFooter>

        </form>
      </Card>
    </div>
  )
}
