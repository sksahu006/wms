'use client';

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
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getWarehouseSpaces } from "@/app/actions/spaceActions/spaceActions";
import { SpaceStatus, SpaceType } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  warehouseId: string;
  initialSpaces: any;
  tab: string;
  page: number;
  limit: number;
  search: string;
}

export default function ClientWarehousePage({
  warehouseId,
  initialSpaces,
  tab,
  page,
  limit,
  search,
}: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [spaces, setSpaces] = useState<any[]>(initialSpaces?.spaces || []);
  const [stats, setStats] = useState({
    totalSpaces: initialSpaces?.stats?.totalSpaces || 0,
    occupiedSpaces: initialSpaces?.stats?.occupiedSpaces || 0,
    availableSpaces: initialSpaces?.stats?.availableSpaces || 0,
    coldStorageSpaces: initialSpaces?.stats?.coldStorageSpaces || 0,
  });
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    const fetchSpaces = async () => {
      setIsLoading(true);
      try {
        let status: SpaceStatus | undefined;
        let type: SpaceType | undefined;
        if (tab === "occupied") status = "OCCUPIED";
        if (tab === "vacant") status = "AVAILABLE";
        if (tab === "cold") type = "COLD";

        const response = await getWarehouseSpaces({
          warehouseId,
          page,
          limit,
          status,
          type,
          search: searchInput,
        });

        if (response.success && response.data) {
          setSpaces(response.data.spaces);
          setStats(response.data.stats);
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: response.error || "Failed to fetch spaces",
          });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSpaces();
  }, [warehouseId, tab, page, limit, searchInput, toast]);

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    if (searchInput) {
      params.set("search", searchInput);
    } else {
      params.delete("search");
    }
    params.set("page", "1");
    router.push(`/dashboard/warehouse/${warehouseId}?${params.toString()}`);
  };

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", newTab);
    params.set("page", "1");
    router.push(`/dashboard/warehouse/${warehouseId}?${params.toString()}`);
  };

  const warehouseStats = [
    { title: "Total Spaces", value: stats.totalSpaces, icon: Warehouse, description: "All spaces in this warehouse" },
    { title: "Occupied Spaces", value: stats.occupiedSpaces, icon: Package, description: "Currently allocated spaces" },
    { title: "Available Spaces", value: stats.availableSpaces, icon: Building2, description: "Available for allocation" },
    { title: "Cold Storage", value: stats.coldStorageSpaces, icon: Snowflake, description: "Refrigerated spaces" },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Warehouse Management</h1>
        <Link href={`/dashboard/warehouse/${warehouseId}/add`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Space
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {warehouseStats.map((stat, index) => (
          <Card key={index} className="bg-blue-900 text-white">
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
          <Tabs value={tab} onValueChange={handleTabChange} className="space-y-4">
            <div className="flex items-center justify-between">
              <TabsList className="text-white">
                <TabsTrigger value="all">All Spaces</TabsTrigger>
                <TabsTrigger value="occupied">Occupied</TabsTrigger>
                <TabsTrigger value="vacant">Vacant</TabsTrigger>
                <TabsTrigger value="cold">Cold Storage</TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search spaces..."
                    className="w-[200px] pl-8"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">Loading spaces...</div>
            ) : (
              <>
                {["all", "occupied", "vacant", "cold"].map((tabKey) => (
                  <TabsContent key={tabKey} value={tabKey}>
                    <SpaceTable
                      spaces={spaces}
                      warehouseId={warehouseId}
                      showClient
                      showStatus
                      showUtilization
                      showExpiry
                    />
                  </TabsContent>
                ))}
              </>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function SpaceTable({
  spaces,
  warehouseId,
  showClient = false,
  showStatus = false,
  showUtilization = false,
  showExpiry = false,
}: {
  spaces: any[];
  warehouseId: string;
  showClient?: boolean;
  showStatus?: boolean;
  showUtilization?: boolean;
  showExpiry?: boolean;
}) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-900 ">
            <TableHead className="text-white">ID</TableHead>
            <TableHead className="text-white">Space Code</TableHead>
            <TableHead className="text-white">Type</TableHead>
            <TableHead className="text-white">Size</TableHead>
            {showStatus && <TableHead className="text-white">Status</TableHead>}
            {showClient && <TableHead className="text-white">Client</TableHead>}
            {showUtilization && <TableHead className="text-white">Utilization</TableHead>}
            {showExpiry && <TableHead className="text-white">Expiry</TableHead>}
            <TableHead className="text-right text-white">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spaces.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8">
                No spaces found
              </TableCell>
            </TableRow>
          ) : (
            spaces.map((space) => (
              <TableRow key={space.id}>
                <TableCell className="font-medium">{space.spaceCode}</TableCell>
                <TableCell>{space.spaceCode}</TableCell>
                <TableCell>
                  {space.type === "COLD" ? (
                    <div className="flex items-center">
                      <Snowflake className="mr-1 h-4 w-4 text-blue-500" />
                      Cold Storage
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Package className="mr-1 h-4 w-4" />
                      {space.type}
                    </div>
                  )}
                </TableCell>
                <TableCell>{space.size}</TableCell>
                {showStatus && (
                  <TableCell>
                    <Badge
                      variant={space.status === "OCCUPIED" ? "default" : "outline"}
                      className={space.status === "OCCUPIED" ? "bg-green-500" : "border-blue-500 text-blue-500"}
                    >
                      {space.status === "OCCUPIED" ? "Occupied" : space.status}
                    </Badge>
                  </TableCell>
                )}
                {showClient && <TableCell>{space.client?.name || "—"}</TableCell>}
                {showUtilization && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={space.utilization || 0} className="h-2 w-[60px]" />
                      <span className="text-xs">{space.utilization || 0}%</span>
                    </div>
                  </TableCell>
                )}
                {showExpiry && (
                  <TableCell>
                    {space.expiryDate ? new Date(space.expiryDate).toLocaleDateString() : "—"}
                  </TableCell>
                )}
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
                      <DropdownMenuItem>
                        <Link href={`/dashboard/warehouse/${warehouseId}/${space.id}`}>View details</Link>
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem>
                        <Link href={`/dashboard/warehouse/${warehouseId}/${space.id}/edit`}>Edit space</Link>
                      </DropdownMenuItem> */}
                      <DropdownMenuSeparator />
                      {/* {space.status === "AVAILABLE" ? (
                        <DropdownMenuItem className="text-green-600">
                          <Link href={`/dashboard/warehouse/${warehouseId}/${space.id}`}>Allocate space</Link>
                        </DropdownMenuItem>
                      ) : (
                        <>
                          <DropdownMenuItem>View agreement</DropdownMenuItem>
                          <DropdownMenuItem>Extend lease</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Terminate lease</DropdownMenuItem>
                        </>
                      )} */}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}