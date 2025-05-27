import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Edit, Loader2 } from 'lucide-react';
import { getAllAgreements } from '@/app/actions/aggrementActions/aggrements';
import { getServerAuth } from '@/lib/auth';

type Agreement = {
  id: string;
  clientName: string | null;
  spaceType: string;
  areaSqft: number;
  monthlyRentAmount: number;
  status: string;
};

type Pagination = {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type AgreementsPageProps = {
  searchParams: { page?: string };
};

export default async function AgreementsPage({ searchParams }: AgreementsPageProps) {
  const page = parseInt(searchParams.page || '1', 10);
  const itemsPerPage = 10;
  const skip = (page - 1) * itemsPerPage;
  const session = await getServerAuth();

  // Fetch agreements on the server
  const result = await getAllAgreements(itemsPerPage, skip);

  const agreements: Agreement[] = result.success ? result.agreements || [] : [];
  const pagination: Pagination = result.success
    ? result.pagination || {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    }
    : {
      totalItems: 0,
      totalPages: 0,
      currentPage: 1,
      itemsPerPage: 10,
      hasNextPage: false,
      hasPreviousPage: false,
    };
  const error = result.success ? null : result.error || 'Failed to fetch agreements';

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Agreements</h1>
        <Link href="/dashboard/agreements/add">
          <Button>Add Agreement</Button>
        </Link>
      </div>

      <Card className='shadow-lg border-[1px] border-gray-300'>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <p className="text-red-500">{error}</p>
          ) : agreements.length === 0 ? (
            <div className="text-center py-4">
              <p>No agreements found.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className='bg-blue-900'>
                    <TableHead className='text-white'>Client Name</TableHead>
                    <TableHead className='text-white'>Space Type</TableHead>
                    <TableHead className='text-white'>Area (sqft)</TableHead>
                    <TableHead className='text-white'>Monthly Rent</TableHead>
                    <TableHead className='text-white'>Status</TableHead>
                    <TableHead className='text-white'>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className='text-black dark:text-white bg-white dark:bg-black '>
                  {agreements.map((agreement) => (
                    <TableRow  className='border-b-[1px] border-b-gray-300 shadow-md' key={agreement.id}>
                      <TableCell className='font-mono'>{agreement.clientName || 'N/A'}</TableCell>
                      <TableCell>{agreement.spaceType}</TableCell>
                      <TableCell>{agreement.areaSqft}</TableCell>
                      <TableCell> ₹{agreement.monthlyRentAmount}</TableCell>
                      <TableCell className='font-mono'>{agreement.status}</TableCell>
                      {/* <TableCell>
                        <Link href={`/dashboard/agreements/${agreement.id}`}>
                          <Button variant="link">View</Button>
                        </Link>
                        {session && session.user.role === 'ADMIN' && <Link href={`/dashboard/agreements/${agreement.id}/edit`}>
                          <Button variant="link">
                            Edit <Edit className="text-green-300" />
                          </Button>
                        </Link>}
                      </TableCell> */}
                      <TableCell className="space-x-2 text-right">
                        <Link href={`/dashboard/agreements/${agreement.id}`}>
                          <Button
                            variant="link"
                            className="text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            View
                          </Button>
                        </Link>

                        {session && session.user.role === 'ADMIN' && (
                          <Link href={`/dashboard/agreements/${agreement.id}/edit`}>
                            <Button
                              variant="link"
                              className="text-green-600 hover:text-green-800 font-semibold "
                            >
                              Edit <Edit className="text-green-400 size-4" />
                            </Button>
                          </Link>
                        )}
                      </TableCell>

                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {pagination.currentPage} of {pagination.totalPages} (Total: {pagination.totalItems} agreements)
                </div>
                {/* <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasPreviousPage}
                  >
                    <Link href={`/dashboard/agreements?page=${pagination.currentPage - 1}`}>
                      Previous
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!pagination.hasNextPage}
                  >
                    <Link href={`/dashboard/agreements?page=${pagination.currentPage + 1}`}>
                      Next
                    </Link>
                  </Button>
                </div> */}
                <div className="flex items-center gap-2">
                  <Link href={`/dashboard/agreements?page=${pagination.currentPage - 1}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasPreviousPage}
                      className={`text-white border-none ${!pagination.hasPreviousPage
                          ? 'bg-[#7737ec] hover:from-purple-600 hover:to-pink-600 cursor-not-allowed'
                          : 'bg-[#7737ec] hover:bg-black hover:text-white '
                        }`}
                    >
                      Previous
                    </Button>
                  </Link>

                  <Link href={`/dashboard/agreements?page=${pagination.currentPage + 1}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={!pagination.hasNextPage}
                      className={`text-white border-none ${!pagination.hasNextPage
                          ? 'bg-gradient-to-r from-green-500 to-blue-500  text-white disabled:opacity-50 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600'
                        }`}
                    >
                      Next
                    </Button>
                  </Link>
                </div>


              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}