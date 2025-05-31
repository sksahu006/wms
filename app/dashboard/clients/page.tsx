'use server';

import Link from 'next/link';
import { CheckCircle2, Clock, Download, MoreHorizontal, Plus, Search, SlidersHorizontal, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { getClients, getPendingClientsCount } from '@/app/actions/clientActions/customer';
import { cn } from '@/lib/utils';

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const pageSize = 5; // Adjusted to show fewer rows for demo; align with UI
  const response = await getClients(page, pageSize);
  const { pendingClientsCount } = await getPendingClientsCount();

  if (!response.success || !response.clients) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <Card className=''>
          <CardHeader>
            <CardTitle>Client Management</CardTitle>
            <CardDescription>View and manage all registered clients</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Error: {response.error || 'No clients found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { clients, pagination } = response;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Clients</h1>
        <div className='flex gap-2'>
          <Button asChild>
            <Link href="/dashboard/clients/pending">
              <Clock className="mr-2 h-4 w-4" />
              Pending Client <span className='text-red-500'> ({pendingClientsCount})</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/clients/add">
              <Plus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      <Card className='border border-black'>
        <CardHeader >
          <CardTitle>Client Management</CardTitle>
          <CardDescription>View and manage all registered clients</CardDescription>
        </CardHeader>
        <CardContent >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <div className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Search clients..." className="w-full pl-8" />
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

          <div className="rounded-md border">
            <Table className='border border-black'>
              <TableHeader className=''>
                <TableRow className='bg-blue-900' >
                  <TableHead className='text-white'>ID</TableHead>
                  <TableHead className='text-white'>Company</TableHead>
                  <TableHead className='text-white'>Contact</TableHead>
                  <TableHead className='text-white'>Status</TableHead>
                  <TableHead className='text-white'>Spaces</TableHead>
                  <TableHead className='text-white'>Joined</TableHead>
                  <TableHead className='text-white text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-black dark:text-white bg-white dark:bg-black ">
                {clients?.map((client: any) => (

                  <TableRow key={client.id}>
                    {/* show last 5 characters of id */}
                    <TableCell className="font-medium uppercase">{(client.id)?.slice(-10)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{client.companyName || 'N/A'}</div>
                      <div className="text-sm text-[#390E67] dark:text-[#0DFFD3]">{client.email || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <div>{client.contactName || 'N/A'}</div>
                      <div className="text-sm text-orange-600 dark:text-blue-900">{client.phone || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="default"
                        className="bg-green-500"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {client?.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{client?.spaces?.length || 0}</TableCell>
                    <TableCell>{new Date(client.created).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className='text-white'>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/clients/${client.id}`} className="flex w-full">
                              View details
                            </Link>
                          </DropdownMenuItem>
                          {/* <DropdownMenuItem>Edit client</DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          {/* <DropdownMenuItem>View invoices</DropdownMenuItem>
                          <DropdownMenuItem>View agreements</DropdownMenuItem> */}
                          <DropdownMenuSeparator />
                          {/* {client.status === "PENDING" ? (
                            <DropdownMenuItem className="text-green-600">Approve client</DropdownMenuItem>
                          ) : client.status === "ACTIVE" ? (
                            <DropdownMenuItem className="text-yellow-600">Deactivate client</DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem className="text-green-600">Activate client</DropdownMenuItem>
                          )} */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {pagination.total > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} clients
              </div>
              {/* <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={pagination.page <= 1}
                >
                  <Link href={`?page=${pagination.page - 1}`}>
                    Previous
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={pagination.page >= pagination.totalPages}
                >
                  <Link href={`?page=${pagination.page + 1}`}>
                    Next
                  </Link>
                </Button>
              </div> */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={pagination.page == 1}
                  className={`bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Link href={`?page=${pagination.page - 1}`}>
                    Previous
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={pagination.page >= pagination.totalPages}
                  className={`bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 border-none disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <Link href={`?page=${pagination.page + 1}`}>
                    Next
                  </Link>
                </Button>
              </div>

            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}