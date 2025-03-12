import Link from "next/link"
import { ArrowRight, Building2, Clock, MoreHorizontal, Package, Search, SlidersHorizontal, Snowflake } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export default function ClientSpacesPage() {
  // In a real app, you would fetch the client's spaces
  const clientSpaces = [
    {
      id: "WH-A-101",
      name: "Storage Unit A-101",
      type: "Regular",
      size: "500 sq ft",
      status: "Active",
      startDate: "Jan 15, 2023",
      endDate: "Dec 31, 2023",
      utilization: 85,
      monthlyRate: "$1,200.00",
    }
  ]
  
  // Available spaces that the client can request
  const availableSpaces = [
    {
      id: "WH-B-202",
      name: "Storage Unit B-202",
      type: "Cold Storage",
      size: "300 sq ft",
      monthlyRate: "$1,500.00",
    },
    {
      id: "WH-C-302",
      name: "Storage Unit C-302",
      type: "Regular",
      size: "1000 sq ft",
      monthlyRate: "$2,000.00",
    },
  ]
  
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">My Spaces</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Spaces
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Currently rented spaces
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Storage
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">500 sq ft</div>
            <p className="text-xs text-muted-foreground">
              Across all spaces
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Cost
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,200.00</div>
            <p className="text-xs text-muted-foreground">
              Total monthly payments
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Rented Spaces</CardTitle>
          <CardDescription>
            View and manage your current warehouse spaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search spaces..."
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
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Space Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Lease Period</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clientSpaces.length > 0 ? (
                  clientSpaces.map((space) => (
                    <TableRow key={space.id}>
                      <TableCell className="font-medium">{space.id}</TableCell>
                      <TableCell>{space.name}</TableCell>
                      <TableCell>
                        {space.type === "Cold Storage" ? (
                          <div className="flex items-center">
                            <Snowflake className="mr-1 h-4 w-4 text-blue-500" />
                            {space.type}
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Package className="mr-1 h-4 w-4" />
                            {space.type}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{space.size}</TableCell>
                      <TableCell>
                        {space.startDate} - {space.endDate}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={space.utilization} className="h-2 w-[60px]" />
                          <span className="text-xs">{space.utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/dashboard/spaces/${space.id}`}>
                                View details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>View agreement</DropdownMenuItem>
                            <DropdownMenuItem>View invoices</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Request maintenance</DropdownMenuItem>
                            <DropdownMenuItem>Request extension</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      You don't have any rented spaces yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Spaces</CardTitle>
          <CardDescription>
            Browse and request available warehouse spaces
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableSpaces.map((space) => (
              <Card key={space.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {space.type === "Cold Storage" ? (
                      <Snowflake className="h-12 w-12 text-blue-500/20" />
                    ) : (
                      <Package className="h-12 w-12 text-muted-foreground/20" />
                    )}
                  </div>
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-lg">{space.name}</CardTitle>
                  <CardDescription>
                    {space.type} - {space.size}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">
                      {space.type === "Cold Storage" ? (
                        <Snowflake className="mr-1 h-3 w-3 text-blue-500" />
                      ) : (
                        <Package className="mr-1 h-3 w-3" />
                      )}
                      {space.type}
                    </Badge>
                    <span className="font-medium">{space.monthlyRate}/month</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" asChild>
                    <Link href={`/dashboard/spaces/request/${space.id}`}>
                      Request Space
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
