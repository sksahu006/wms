'use server';

import Link from 'next/link';
import { CheckCircle2, Download, MoreHorizontal, Plus, Search, SlidersHorizontal } from 'lucide-react';
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
import { getAllAdmins } from '@/app/actions/admin/admin';
import AddAdminFormModal from '@/components/AddAdminFormModal';
import EditAdminFormModal from '@/components/EditAdminFormModal';


export default async function AdminsPage({
  searchParams,
}: {
  searchParams: { page?: string; search?: string };
}) {
  const page = parseInt(searchParams.page || '1', 10);
  const search = searchParams.search || '';
  const pageSize = 10;
  const response = await getAllAdmins({ page, pageSize, searchTerm: search });

  if (!response.success || !response.admins) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
        <Card>
          <CardHeader>
            <CardTitle>Admin Management</CardTitle>
            <CardDescription>View and manage all registered admins</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Error: {response.error || 'No admins found'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { admins, pagination } = response;

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Admins</h1>
        <div className="flex gap-2">
          <AddAdminFormModal/>
        </div>
      </div>

      <Card className="border border-black">
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>View and manage all registered active admins</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 w-full max-w-sm">
              <form action="/dashboard/admins" method="GET" className="relative w-full">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  name="search"
                  placeholder="Search admins..."
                  defaultValue={search}
                  className="w-full pl-8"
                />
              </form>
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
            <Table className="border border-black">
              <TableHeader>
                <TableRow className="bg-blue-900">
                  <TableHead className="text-white">ID</TableHead>
                  <TableHead className="text-white">Name</TableHead>
                  <TableHead className="text-white">Email</TableHead>
                  <TableHead className="text-white">Status</TableHead>
                  <TableHead className="text-white">Joined</TableHead>
                  <TableHead className="text-white text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="text-black dark:text-white bg-white dark:bg-black">
                {admins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium uppercase">{admin.id.slice(-10)}</TableCell>
                    <TableCell>
                      <div className="font-medium">{admin.name || 'N/A'}</div>
                      <div className="text-sm text-[#390E67] dark:text-[#0DFFD3]">{admin.companyName || 'N/A'}</div>
                    </TableCell>
                    <TableCell>{admin.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        {admin.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(admin.created).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                         <EditAdminFormModal admin={admin} />
                      {/* <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="text-white">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/admins/${admin.id}/admin`} className="flex w-full">
                              View details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <EditAdminFormModal admin={admin} />
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu> */}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
{/* 
          {pagination.total > 0 && (
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.pageSize + 1} to{' '}
                {Math.min(pagination.page * pagination.pageSize, pagination.total)} of {pagination.total} admins
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={pagination.page === 1}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Link href={{ query: { page: pagination.page - 1, search } }}>Previous</Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  disabled={pagination.page >= pagination.totalPages}
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600 border-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Link href={{ query: { page: pagination.page + 1, search } }}>Next</Link>
                </Button>
              </div>
            </div>
          )} */}
        </CardContent>
      </Card>
    </div>
  );
}