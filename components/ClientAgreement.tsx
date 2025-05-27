"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAgreementsByUser, getAllAgreements } from "@/app/actions/aggrementActions/aggrements";

type Status = "PENDING" | "ACTIVE" | "INACTIVE";
type SpaceType = "REGULAR" | "COLD" | "HAZARDOUS" | "OUTDOOR";

interface Agreement {
  id: string;
  clientName?: string;
  spaceType: SpaceType;
  areaSqft: number;
  monthlyRentAmount: number;
  status: Status;
}

interface AgreementsResponse {
  success: boolean;
  agreements: any[];
  pagination: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  error?: string;
}

interface ClientAgreementProps {
  clientId: string;
  searchParams: { page?: number };
}

export default function ClientAgreement({ clientId, searchParams }: ClientAgreementProps) {
  const searchParamsHook = useSearchParams();
  const router = useRouter();
  const page = Number(searchParamsHook.get("page")) || searchParams.page || 1;
  const take = 10;
  const skip = (page - 1) * take;
  const [agreementsData, setAgreementsData] = useState<AgreementsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgreements() {
      try {
        setLoading(true);
        const result = await getAgreementsByUser(clientId, take, skip);
        console.log(result)
        if (result?.success && result?.agreements && result?.pagination) {
          setAgreementsData(result);
        } else {
          setError(result.error || "Failed to fetch agreements");
        }
      } catch (err) {
        setError("An error occurred while fetching agreements");
      } finally {
        setLoading(false);
      }
    }
    fetchAgreements();
  }, [page, skip]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParamsHook);
    params.set("page", newPage.toString());
    router.push(`? ${params.toString()}`);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-destructive text-center py-4">{error}</div>;
  if (!agreementsData || agreementsData?.agreements?.length === 0)
    return <div className="text-center py-4">No agreements found</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Agreements</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-600">
            <TableHead>Client Name</TableHead>
            <TableHead>Space Type</TableHead>
            <TableHead>Area (sq ft)</TableHead>
            <TableHead>Monthly Rent</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreementsData.agreements.map((agreement) => (
            <TableRow key={agreement.id}>
              <TableCell>{agreement.clientName || "N/A"}</TableCell>
              <TableCell>{agreement.spaceType}</TableCell>
              <TableCell>{agreement.areaSqft}</TableCell>
              <TableCell> ₹{agreement.monthlyRentAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    agreement.status === "ACTIVE"
                      ? "default"
                      : agreement.status === "PENDING"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {agreement.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <p>
          Page {agreementsData.pagination.currentPage} of {agreementsData.pagination.totalPages}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={!agreementsData.pagination.hasPreviousPage}
            onClick={() => handlePageChange(agreementsData.pagination.currentPage - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={!agreementsData.pagination.hasNextPage}
            onClick={() => handlePageChange(agreementsData.pagination.currentPage + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}