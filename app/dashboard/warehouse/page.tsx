'use client';

import { useEffect, useState } from 'react';
import { Edit, Warehouse } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getAllWarehouses } from '@/app/actions/warehouseActions/warehouseActions';
import { SpaceStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import DeleteWarehouseButton from '@/components/DeleteWarehouseButton';

type Space = {
  id: string;
  status: SpaceStatus;
  type: string;
  createdAt: Date;
  warehouseId: string;
  spaceCode: string;
  size: number;
  clientId: string | null;
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  location: string;
  storageType: string;
  capacity: number;
  managerId: string;
  createdAt: Date;
  manager: {
    name: string | null;
  };
  spaces: Space[];
};

export default function WarehousePage() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();
   const [fetchTrigger, setFetchTrigger] = useState(0);

  if (!session?.data?.user || session.data.user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Access Denied</h1>
        <p className="text-lg text-gray-600">You do not have permission to access this page.</p>
      </div>
    );
  }

  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  // Get query params for pagination and search
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const search = searchParams.get('search') || '';

  // Fetch warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      setIsLoading(true);
      const response = await getAllWarehouses({ page, limit, search });
      console.log(response)

      if (response.success) {
        if (response.data) {
          setWarehouses(response.data.warehouses);
          setTotalPages(response.data.totalPages);
          setTotalItems(response.data.totalItems);
        } else {
          console.error('No data returned from API');
        }
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: response.error || 'Failed to fetch warehouses',
        });
      }
      setIsLoading(false);
    };

    fetchWarehouses();
  }, [page, limit, search, toast, fetchTrigger]); // Add fetchTrigger to re-fetch on delete



  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (newSearch) {
      params.set('search', newSearch);
      params.set('page', '1'); // Reset to first page on new search
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`?${params.toString()}`);
  };
    const handleDelete = () => {
    setFetchTrigger((prev) => prev + 1); // Trigger re-fetch
  };


  const occupiedCount = warehouses?.reduce(
    (sum: number, wrh: any) =>
      sum + (wrh.spaces?.filter((s: any) => s.status === 'OCCUPIED').length || 0),
    0
  );

  const vacantCount =  warehouses.reduce((sum: number, wrh: any) => sum + (wrh.spaces?.length || 0), 0)

  const vacant = vacantCount - occupiedCount;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">Total Warehouses</h2>
            <p className="text-xl font-semibold">{totalItems}</p>
          </CardContent>
        </Card>
        <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">Total Storage Units</h2>
            <p className="text-xl font-semibold">
              {warehouses.reduce((sum: number, wrh: any) => sum + (wrh.spaces?.length || 0), 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">Occupied Storage Units</h2>
            <p className="text-xl font-semibold">
              {warehouses.reduce(
                (sum: number, wrh: any) =>
                  sum + (wrh.spaces?.filter((s: any) => s.status === 'OCCUPIED').length || 0),
                0
              )}
            </p>
          </CardContent>
        </Card>
        <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
          <CardContent className="pt-6">
            <h2 className="text-lg font-bold">Vacant Storage Units</h2>
            <p className="text-xl font-semibold">
              {vacant}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Header with Search and Add Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Warehouses</h1>
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search warehouses nam...."
            value={search}
            onChange={handleSearch}
            className="w-64 shadow-md border-[1px] border-gray-300 dark:border-gray-600"
          />
          <Link href="/dashboard/warehouse/add">
            <Button>
              <Warehouse className="mr-2 h-4 w-4" /> Add Warehouse
            </Button>
          </Link>
        </div>
      </div>

      {/* Warehouse Table */}
      <Card>
        <CardHeader>
          <CardTitle>Warehouse List</CardTitle>
          <CardDescription>Manage all warehouses and their spaces</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div>Loading...</div>
          ) : warehouses.length === 0 ? (
            <div>No warehouses found.</div>
          ) : (
            <>
              <Table>
                <TableHeader className='p-2'>
                  <TableRow className='text-white bg-blue-900 p-2'>
                    <TableHead className='text-white'>Code</TableHead>
                    <TableHead className='text-white'>Name</TableHead>
                    <TableHead className='text-white'>Location</TableHead>
                    <TableHead className='text-white whitespace-nowrap'>Total Spaces</TableHead>
                    <TableHead className='text-white whitespace-nowrap'>Occupied Spaces</TableHead>
                    {/* <TableHead className='text-white'>Manager</TableHead> */}
                    <TableHead className="text-right text-white">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className='text-black dark:text-white bg-white dark:bg-black '>
                  {warehouses.map((wrh: any) => (
                    <TableRow key={wrh.id} className='border-b-[1px] border-b-gray-300 shadow-md'>
                      <TableCell className="font-medium">{wrh.code}</TableCell>
                      <TableCell>{wrh.name}</TableCell>
                      <TableCell>{wrh.location}</TableCell>
                      <TableCell>{wrh.spaces?.length || 0}</TableCell>
                      <TableCell>
                        {/* {wrh.spaces?.filter((s: any) => s.status === 'Occupied').length || 0} */}
                        {wrh._count.spaces || 0}
                      </TableCell>
                      {/* <TableCell className='whitespace-nowrap'>{wrh.manager?.name || 'N/A'}</TableCell> */}
                      {/* <TableCell className="text-right space-x-2">
                        <Link href={`/dashboard/warehouse/${wrh.id}`}>
                          <Button variant="outline" size="sm" className='text-xs'>
                            View Spaces
                          </Button>
                        </Link>
                        <Link href={`/dashboard/warehouse/edit/${wrh.id}`}>
                          <Button variant="outline" size="sm">
                           <Edit className='size-2 text-green-500'/> Edit
                          </Button>
                        </Link>
                      </TableCell> */}
                      <TableCell className="text-right space-x-2 whitespace-nowrap">
                        <Link href={`/dashboard/warehouse/${wrh.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 border-none"
                          >
                            View Spaces
                          </Button>
                        </Link>

                        <Link href={`/dashboard/warehouse/edit/${wrh.id}`}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-white bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-900 hover:to-emerald-600 border-none "
                          >
                            <Edit className="size-3 text-white" />
                            Edit
                          </Button>
                        </Link>
                       <DeleteWarehouseButton warehouseId={wrh.id} onDelete={handleDelete} />
                      </TableCell>


                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div>
                  Showing {(page - 1) * limit + 1} to{' '}
                  {Math.min(page * limit, totalItems)} of {totalItems} warehouses
                </div>
                {/* <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div> */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`border-none text-white ${page === 1
                      ? 'bg-gradient-to-r from-purple-300 to-pink-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
                      }`}
                  >
                    Previous
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className={`border-none text-white ${page >= totalPages
                      ? 'bg-gradient-to-r from-green-300 to-blue-300 opacity-50 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                      }`}
                  >
                    Next
                  </Button>
                </div>

              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}