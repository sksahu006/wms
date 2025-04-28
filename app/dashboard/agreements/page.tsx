'use client'

import { useState, useEffect } from 'react';
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
import { Loader2 } from 'lucide-react';
import { getAllAgreements } from '@/app/actions/aggrementActions/aggrements';

type Agreement = {
  id: string;
  clientName: string | null;
  spaceType: string;
  areaSqft: number;
  monthlyRentAmount: number;
  status: string;
};

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgreements = async (page: number, itemsPerPage: number = 10) => {
    setLoading(true);
    const skip = (page - 1) * itemsPerPage;
    const result = await getAllAgreements(itemsPerPage, skip);
    if (result.success) {
      setAgreements(result.agreements || []);
      setPagination(result.pagination || {
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        itemsPerPage: 10,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      setError(null);
    } else {
        setError(result.error ?? null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAgreements(1);
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Agreements</h1>
        <Link href="/dashboard/agreements/add">
          <Button>Add Agreement</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agreements</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : agreements.length === 0 ? (
            <div className="text-center py-4">
              <p>No agreements found.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Space Type</TableHead>
                    <TableHead>Area (sqft)</TableHead>
                    <TableHead>Monthly Rent</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agreements.map((agreement) => (
                    <TableRow key={agreement.id}>
                      <TableCell>{agreement.clientName || 'N/A'}</TableCell>
                      <TableCell>{agreement.spaceType}</TableCell>
                      <TableCell>{agreement.areaSqft}</TableCell>
                      <TableCell>${agreement.monthlyRentAmount}</TableCell>
                      <TableCell>{agreement.status}</TableCell>
                      <TableCell>
                        <Link href={`/dashboard/agreements/${agreement.id}`}>
                          <Button variant="link">View</Button>
                        </Link>
                        <Link href={`/dashboard/agreements/${agreement.id}/edit`}>
                          <Button variant="link">Edit</Button>
                        </Link>
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
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!pagination.hasPreviousPage}
                    onClick={() => fetchAgreements(pagination.currentPage - 1, pagination.itemsPerPage)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    disabled={!pagination.hasNextPage}
                    onClick={() => fetchAgreements(pagination.currentPage + 1, pagination.itemsPerPage)}
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
