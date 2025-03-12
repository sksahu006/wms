import {
  Building2,
  Download,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  Snowflake,
  Warehouse,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function WarehousePage() {
  const warehouseSpaces = [
    {
      id: "WH-A-101",
      name: "Storage Unit A-101",
      type: "Regular",
      size: "500 sq ft",
      client: "Acme Corporation",
      clientId: "WMS001",
      status: "Occupied",
      utilization: 85,
      expiryDate: "Dec 31, 2023",
    },
    {
      id: "WH-A-102",
      name: "Storage Unit A-102",
      type: "Regular",
      size: "750 sq ft",
      client: "TechSolutions Inc",
      clientId: "WMS002",
      status: "Occupied",
      utilization: 60,
      expiryDate: "Jan 15, 2024",
    },
    {
      id: "WH-B-201",
      name: "Storage Unit B-201",
      type: "Cold Storage",
      size: "300 sq ft",
      client: "Manufacturing Pro",
      clientId: "WMS005",
      status: "Occupied",
      utilization: 90,
      expiryDate: "Feb 28, 2024",
    },
    {
      id: "WH-B-202",
      name: "Storage Unit B-202",
      type: "Cold Storage",
      size: "300 sq ft",
      client: null,
      clientId: null,
      status: "Vacant",
      utilization: 0,
      expiryDate: null,
    },
    {
      id: "WH-C-301",
      name: "Storage Unit C-301",
      type: "Regular",
      size: "1000 sq ft",
      client: "Retail Enterprises",
      clientId: "WMS004",
      status: "Occupied",
      utilization: 75,
      expiryDate: "Mar 15, 2024",
    },
    {
      id: "WH-C-302",
      name: "Storage Unit C-302",
      type: "Regular",
      size: "1000 sq ft",
      client: null,
      clientId: null,
      status: "Vacant",
      utilization: 0,
      expiryDate: null,
    },
    {
      id: "WH-D-401",
      name: "Storage Unit D-401",
      type: "Regular",
      size: "250 sq ft",
      client: "Manufacturing Pro",
      clientId: "WMS005",
      status: "Occupied",
      utilization: 95,
      expiryDate: "Apr 30, 2024",
    },
    {
      id: "WH-D-402",
      name: "Storage Unit D-402",
      type: "Regular",
      size: "250 sq ft",
      client: "Manufacturing Pro",
      clientId: "WMS005",
      status: "Occupied",
      utilization: 70,
      expiryDate: "Apr 30, 2024",
    },
  ]

  const warehouseStats = [
    {
      title: "Total Spaces",
      value: "8",
      icon: Warehouse,
      description: "All warehouse units",
    },
    {
      title: "Occupied",
      value: "6",
      icon: Package,
      description: "Currently in use",
    },
    {
      title: "Vacant",
      value: "2",
      icon: Building2,
      description: "Available for rent",
    },
    {
      title: "Cold Storage",
      value: "2",
      icon: Snowflake,
      description: "Temperature controlled",
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Warehouse Management</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Space
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {warehouseStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Warehouse Spaces</CardTitle>
          <CardDescription>Manage all warehouse spaces and their allocations</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="all">All Spaces</TabsTrigger>
                <TabsTrigger value="occupied">Occupied</TabsTrigger>
                <TabsTrigger value="vacant">Vacant</TabsTrigger>
                <TabsTrigger value="cold">Cold Storage</TabsTrigger>
              </TabsList>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search spaces..." className="w-[200px] pl-8" />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span className="sr-only">Filter</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>

            <TabsContent value="all">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Space Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouseSpaces.map((space) => (
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
                          <Badge
                            variant={space.status === "Occupied" ? "default" : "outline"}
                            className={space.status === "Occupied" ? "bg-green-500" : "border-blue-500 text-blue-500"}
                          >
                            {space.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{space.client || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={space.utilization} className="h-2 w-[60px]" />
                            <span className="text-xs">{space.utilization}%</span>
                          </div>
                        </TableCell>
                        <TableCell>{space.expiryDate || "—"}</TableCell>
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
                              <DropdownMenuItem>View details</DropdownMenuItem>
                              <DropdownMenuItem>Edit space</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {space.status === "Vacant" ? (
                                <DropdownMenuItem className="text-green-600">Allocate space</DropdownMenuItem>
                              ) : (
                                <>
                                  <DropdownMenuItem>View agreement</DropdownMenuItem>
                                  <DropdownMenuItem>Extend lease</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Terminate lease</DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="occupied">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Space Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouseSpaces
                      .filter((space) => space.status === "Occupied")
                      .map((space) => (
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
                          <TableCell>{space.client}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={space.utilization} className="h-2 w-[60px]" />
                              <span className="text-xs">{space.utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{space.expiryDate}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="vacant">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Space Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouseSpaces
                      .filter((space) => space.status === "Vacant")
                      .map((space) => (
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
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              <Plus className="mr-1 h-3 w-3" /> Allocate
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="cold">
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Space Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Expiry</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {warehouseSpaces
                      .filter((space) => space.type === "Cold Storage")
                      .map((space) => (
                        <TableRow key={space.id}>
                          <TableCell className="font-medium">{space.id}</TableCell>
                          <TableCell>{space.name}</TableCell>
                          <TableCell>{space.size}</TableCell>
                          <TableCell>
                            <Badge
                              variant={space.status === "Occupied" ? "default" : "outline"}
                              className={space.status === "Occupied" ? "bg-green-500" : "border-blue-500 text-blue-500"}
                            >
                              {space.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{space.client || "—"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={space.utilization} className="h-2 w-[60px]" />
                              <span className="text-xs">{space.utilization}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{space.expiryDate || "—"}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

