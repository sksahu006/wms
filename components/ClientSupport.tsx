"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSupportTickets } from "@/app/actions/support/supportAction";

type SupportStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: SupportStatus;
  category: string;
  priority: string;
  space?: { spaceCode: string; name?: string };
  createdAt: string;
  updatedAt: string;
}

interface SupportResponse {
  success: boolean;
  tickets: any[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  stats: {
    totalTickets: number;
    openTickets: number;
    resolvedTickets: number;
  };
  error?: string;
}

interface ClientSupportProps {
  clientId: string;
}

export default function ClientSupport({ clientId }: ClientSupportProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page")) || 1;
  const filter = searchParams.get("filter") || "all";
  const pageSize = 10;
  const [supportData, setSupportData] = useState<SupportResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSupportTickets() {
      try {
        setLoading(true);
        const result = await getSupportTickets(page, pageSize, filter);
        if (result?.success) {
          setSupportData(result as SupportResponse);
        } else {
          setSupportData(null);
          setError(result.error || "Failed to fetch support tickets");
        }
      } catch (err) {
        setError("An error occurred while fetching support tickets");
      } finally {
        setLoading(false);
      }
    }
    fetchSupportTickets();
  }, [page, filter]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  const handleFilterChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", value);
    params.set("page", "1"); // Reset to page 1 on filter change
    router.push(`?${params.toString()}`);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-destructive text-center py-4">{error}</div>;
  if (!supportData || supportData.tickets.length === 0)
    return <div className="text-center py-4">No support tickets found</div>;

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Support Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{supportData.stats.totalTickets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Open Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{supportData.stats.openTickets}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Resolved Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{supportData.stats.resolvedTickets}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mb-4">
        <Select onValueChange={handleFilterChange} defaultValue={filter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="open">Open/In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ticket ID</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Space</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {supportData.tickets.map((ticket) => (
            <TableRow key={ticket.id}>
              <TableCell>{ticket.id}</TableCell>
              <TableCell>{ticket.subject}</TableCell>
              <TableCell>{ticket.space?.spaceCode || "N/A"}</TableCell>
              <TableCell>{ticket.category}</TableCell>
              <TableCell>{ticket.priority}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    ticket.status === "RESOLVED" || ticket.status === "CLOSED"
                      ? "default"
                      : ticket.status === "IN_PROGRESS"
                      ? "secondary"
                      : "destructive"
                  }
                >
                  {ticket.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <p>
          Page {supportData.pagination.page} of {supportData.pagination.totalPages}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={supportData.pagination.page === 1}
            onClick={() => handlePageChange(supportData.pagination.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={supportData.pagination.page === supportData.pagination.totalPages}
            onClick={() => handlePageChange(supportData.pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}