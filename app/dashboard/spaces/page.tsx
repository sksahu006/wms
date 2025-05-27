'use server';

import Link from 'next/link';
import { ArrowRight, Building2, Clock, MoreHorizontal, Package, Search, SlidersHorizontal, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { SpaceStatus, SpaceType } from '@prisma/client';
import { getSpaces } from '@/app/actions/clientActions/customer';
import { getSpacesByUserId } from '@/app/actions/spaceActions/spaceActions';
import { getServerAuth } from '@/lib/auth';
import { RequestSpaceForm } from '@/components/RequestSpaceForm';

export default async function ClientSpacesPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const session = await getServerAuth();
  const userId = session?.user?.id ?? '';
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';

  // Fetch rented spaces for the client
  const rentedSpacesResult = await getSpacesByUserId({
    userId,
    page,
    limit: 10,
    search,
  });
  // Fetch available spaces for the client
  const availableSpacesResult = await getSpaces({ page: 1, pageSize: 10, search, SpaceStatus: 'AVAILABLE' });
  console.log('Fetched spaces:', availableSpacesResult);

  // Process rented spaces
  const rentedSpaces = rentedSpacesResult.success && rentedSpacesResult.data
    ? rentedSpacesResult.data.spaces.map((space) => ({
        id: space.id,
        name: space.name || space.spaceCode,
        type: space.type,
        size: `${space.size} sq ft`,
        status: space.status === SpaceStatus.OCCUPIED ? 'Active' : 'Inactive',
        startDate: space.createdAt ? new Date(space.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
        endDate: 'N/A', // Add agreement end date if available in your schema
        utilization: Math.floor(Math.random() * 100), // Placeholder; replace with actual data if available
        rate: space.rate ? `₹${space.rate.toFixed(2)}` : 'N/A',
      }))
    : [];

  // Process available spaces
  const availableSpaces = availableSpacesResult.success && availableSpacesResult.data
    ? availableSpacesResult.data.map((space) => ({
        id: space.id,
        name: space.name || space.spaceCode,
        type: space.type,
        size: `${space.size} sq ft`,
        status: space.status,
        startDate: 'N/A',
        endDate: 'N/A',
        utilization: Math.floor(Math.random() * 100), // Placeholder; replace with actual data if available
        rate: space.rate ? `₹${space.rate.toFixed(2)}` : 'N/A',
      }))
    : [];

  // Calculate stats for rented spaces
  const totalSpaces = rentedSpacesResult.success && rentedSpacesResult.data ? rentedSpacesResult.data.totalItems : 0;
  const totalStorage = rentedSpaces.reduce((sum, space) => sum + parseFloat(space.size), 0);
  const totalMonthlyCost = rentedSpaces.reduce((sum, space) => sum + (parseFloat(space.rate.replace('₹', '')) || 0), 0);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">My Spaces</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Spaces</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSpaces}</div>
            <p className="text-xs text-muted-foreground">Currently rented spaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Storage</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStorage} sq ft</div>
            <p className="text-xs text-muted-foreground">Across all spaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalMonthlyCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Total monthly payments</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Rented Spaces</CardTitle>
          <CardDescription>View and manage your current warehouse spaces</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search spaces..."
                  className="w-full pl-8"
                  defaultValue={search}
                />
              </div>
              <Button variant="outline" size="icon" type="submit">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filter</span>
              </Button>
            </div>
          </form>

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
                {rentedSpaces.length > 0 ? (
                  rentedSpaces.map((space) => (
                    <TableRow key={space.id}>
                      <TableCell className="font-medium">{space.id}</TableCell>
                      <TableCell>{space.name}</TableCell>
                      <TableCell>
                        {space.type === SpaceType.COLD ? (
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
                              <Link href={`/dashboard/spaces/${space.id}`}>View details</Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      You don’t have any rented spaces yet
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
          <CardDescription>Browse and request available warehouse spaces (contact us for more)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableSpaces.map((space) => (
              <Card key={space.id} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {space.type === SpaceType.COLD ? (
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
                      {space.type === SpaceType.COLD ? (
                        <Snowflake className="mr-1 h-3 w-3 text-blue-500" />
                      ) : (
                        <Package className="mr-1 h-3 w-3" />
                      )}
                      {space.type}
                    </Badge>
                    <span className="font-medium">{space?.rate}/month</span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <RequestSpaceForm
                    spaceId={space.id}
                    spaceName={space.name}
                    spaceType={space.type}
                    spaceSize={space.size}
                    spaceRate={space.rate}
                  />
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}