"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getSpacesByUserId } from "@/app/actions/spaceActions/spaceActions";

type SpaceStatus = "AVAILABLE" | "OCCUPIED" | "MAINTENANCE" | "RESERVED";
type SpaceType = "REGULAR" | "COLD" | "HAZARDOUS" | "OUTDOOR";

interface Space {
  id: string;
  spaceCode: string;
  name?: string;
  type: SpaceType;
  size: number;
  height?: number;
  location?: string;
  rate?: number;
  description?: string;
  status: SpaceStatus;
  features: string[];
  images: string[];
  createdAt: string;
  updatedAt: string;
  warehouse: { id: string; name: string; location: string };
  client: { id: string; name: string; email?: string; phone?: string };
}

interface SpacesResponse {
  success: boolean;
  data?: {
    spaces: any[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  error?: string;
}

interface ClientSpacesProps {
  clientId: string;
}

export default function ClientSpaces({ clientId }: ClientSpacesProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const limit = 10;
  const [spacesData, setSpacesData] = useState<SpacesResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpaces() {
      try {
        setLoading(true);
        const result = await getSpacesByUserId({ userId: clientId, page, limit });
        if (result.success) {
          setSpacesData(result.data || null);
        } else {
          setError(result.error || "Failed to fetch spaces");
        }
      } catch (err) {
        setError("An error occurred while fetching spaces");
      } finally {
        setLoading(false);
      }
    }
    fetchSpaces();
  }, [clientId, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-destructive text-center py-4">{error}</div>;
  if (!spacesData || spacesData?.spaces?.length === 0)
    return <div className="text-center py-4">No spaces found</div>;

  return (
    <div className="p-0">
      <h2 className="text-xl font-bold mb-4">Spaces</h2>
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-800">
            <TableHead>Space Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Size (sq ft)</TableHead>
            <TableHead>Rate ($/mo)</TableHead>
            <TableHead>Warehouse</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {spacesData.spaces.map((space) => (
            <TableRow key={space.id}>
              <TableCell>{space.spaceCode}</TableCell>
              <TableCell>{space.name || "N/A"}</TableCell>
              <TableCell>{space.type}</TableCell>
              <TableCell>{space.size}</TableCell>
              <TableCell>{space.rate ? `$${space.rate.toFixed(2)}` : "N/A"}</TableCell>
              <TableCell>{space.warehouse.name}</TableCell>
              <TableCell>{space.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <p>
          Page {spacesData.page} of {spacesData.totalPages}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={spacesData.page === 1}
            onClick={() => handlePageChange(spacesData.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={spacesData.page === spacesData.totalPages}
            onClick={() => handlePageChange(spacesData.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}