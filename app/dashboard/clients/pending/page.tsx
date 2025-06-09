// app/dashboard/clients/pending/page.tsx

"use client"

import { useState, useEffect, FormEvent } from "react"
import Link from "next/link"
import {
  CheckCircle2, Clock, MoreHorizontal, Search,
  SlidersHorizontal, XCircle
} from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { getClients, updateUser } from "@/app/actions/clientActions/customer"
import { useRouter } from "next/navigation"
import { Status } from "@prisma/client"

// Define types for client data
interface Client {
  id: string;
  name: string | null;
  email: string | null;
  companyName: string | null;
  contactName: string | null;
  phone: string | null;
  address: string | null;
  businessType: string | null;
}

export default function PendingClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState<boolean>(true)
  const router = useRouter()

  // Fetch clients on component mount using useEffect
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const result = await getClients(1, 10, Status.PENDING)
        setClients(Array.isArray(result.clients) ? result.clients : [])
      } catch (error) {
        console.error("Error fetching clients:", error)
      } finally {
        setInitialLoading(false)
      }
    }
    
    fetchClients()
  }, [])

  // Handle client status update with loading state
  const handleUpdateUser = async (formData: FormData) => {
    const id = formData.get("id") as string
    const status = formData.get("status") as Status
    
    try {
      setLoadingClientId(id)
      setLoading(true)
      
      // Call the updateUser function
      await updateUser(formData)
      
      // Refresh data after update
      const result = await getClients(1, 10, Status.PENDING)
      setClients(Array.isArray(result.clients) ? result.clients : [])
      
      // Success notification could be added here
      
    } catch (error) {
      console.error("Error updating user:", error)
      // Error notification could be added here
    } finally {
      setLoading(false)
      setLoadingClientId(null)
      // Refresh the page to ensure all server components are updated
      router.refresh()
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Pending Approvals</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client Registration Requests</CardTitle>
          <CardDescription>
            Review and approve pending client registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search pending clients..."
                  className="w-full pl-8"
                />
              </div>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader className="
              bg-blue-900 dark:bg-gray-800 text-black">
                <TableRow className="text-black">
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Contact</TableHead>
                  <TableHead className="text-white">Phone</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead  className="text-white right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {initialLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6">
                      <div className="flex justify-center items-center">
                        <svg className="animate-spin h-5 w-5 mr-3 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Loading clients...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : clients.length > 0 ? (
                  clients.map((client) => (
                    <TableRow key={client.id} className={loadingClientId === client.id ? "opacity-50" : ""}>
                      <TableCell className="font-medium">{client.companyName || client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.contactName}</TableCell>
                      <TableCell>{client.phone}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-yellow-500 text-yellow-500"
                        >
                          <Clock className="mr-1 h-3 w-3" />
                          Pending
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={loading && loadingClientId === client.id}>
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="">
                            <DropdownMenuLabel className="text-gray-800">Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/clients/pending/${client.id}`} className="text-gray-800">
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />

                            {/* Approve Action */}
                            <form action={handleUpdateUser}>
                              <input type="hidden" name="id" value={client.id} />
                              <input type="hidden" name="email" value={client.email || ""} />
                              <input type="hidden" name="status" value="ACTIVE" />
                              <DropdownMenuItem asChild>
                                <button 
                                  type="submit" 
                                  className="w-full text-left text-green-600"
                                  disabled={loading && loadingClientId === client.id}
                                >
                                  {loading && loadingClientId === client.id ? (
                                    <span className="inline-flex items-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Approving...
                                    </span>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="mr-2 h-4 w-4 inline" />
                                      Approve
                                    </>
                                  )}
                                </button>
                              </DropdownMenuItem>
                            </form>

                            {/* Reject Action */}
                            <form action={handleUpdateUser}>
                              <input type="hidden" name="id" value={client.id} />
                              <input type="hidden" name="email" value={client.email || ""} />
                              <input type="hidden" name="status" value="INACTIVE" />
                              <DropdownMenuItem asChild>
                                <button 
                                  type="submit" 
                                  className="w-full text-left text-red-600"
                                  disabled={loading && loadingClientId === client.id}
                                >
                                  {loading && loadingClientId === client.id ? (
                                    <span className="inline-flex items-center">
                                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                      Rejecting...
                                    </span>
                                  ) : (
                                    <>
                                      <XCircle className="mr-2 h-4 w-4 inline" />
                                      Reject
                                    </>
                                  )}
                                </button>
                              </DropdownMenuItem>
                            </form>

                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No pending client requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}