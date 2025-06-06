"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getInvoices } from "@/app/actions/invoiceActions/invoice";

type InvoiceStatus = "PAID" | "PENDING" | "OVERDUE";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number;
  tax: number;
  totalAmount: number;
  status: InvoiceStatus;
  date: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  client: { id: string; name: string };
  space: { id: string; spaceCode: string };
}

interface InvoicesResponse {
  success: boolean;
  data?: {
    invoices: any[];
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    stats: {
      total: { amount: number; count: number };
      paid: { amount: number; count: number };
      pending: { amount: number; count: number };
      overdue: { amount: number; count: number };
    };
  };
  error?: string;
}

interface ClientInvoiceProps {
  clientId: string;
  searchParams: { page?: number };
}

export default function ClientInvoice({ clientId, searchParams }: ClientInvoiceProps) {
  const searchParamsHook = useSearchParams();
  const router = useRouter();
  const page = Number(searchParamsHook.get("page")) || searchParams.page || 1;
  const limit = 10;
  const [invoicesData, setInvoicesData] = useState<InvoicesResponse["data"] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoices() {
      try {
        setLoading(true);
        const result = await getInvoices({ clientId, page, limit });
        if (result.success) {
          setInvoicesData(result.data);
        } else {
          setError(result.error || "Failed to fetch invoices");
        }
      } catch (err) {
        setError("An error occurred while fetching invoices");
      } finally {
        setLoading(false);
      }
    }
    fetchInvoices();
  }, [clientId, page]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParamsHook);
    params.set("page", newPage.toString());
    router.push(`? ${params.toString()}`);
  };

  if (loading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-destructive text-center py-4">{error}</div>;
  if (!invoicesData || invoicesData?.invoices?.length === 0)
    return <div className="text-center py-4">No invoices found</div>;

  return (
    <div className="p-0">
      <h2 className="text font-bold mb-4">Invoices</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Total</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{invoicesData.stats.total.count} invoices</p>
            <p> ₹{invoicesData.stats.total.amount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle  className="text-base">Paid</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{invoicesData.stats.paid.count} invoices</p>
            <p> ₹{invoicesData.stats.paid.amount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle  className="text-base">Pendings</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{invoicesData.stats.pending.count} invoices</p>
            <p> ₹{invoicesData.stats.pending.amount.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle  className="text-base">Overdue</CardTitle>
          </CardHeader>
          <CardContent className="text-xs">
            <p>{invoicesData.stats.overdue.count} invoices</p>
            <p> ₹{invoicesData.stats.overdue.amount.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-blue-700">
            <TableHead>Invoice Number</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Space</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Tax</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoicesData.invoices.map((invoice) => (
            <TableRow key={invoice.id} >
              <TableCell>{invoice.invoiceNumber}</TableCell>
              <TableCell>{invoice.client.name}</TableCell>
              <TableCell>{invoice.space.spaceCode}</TableCell>
              <TableCell> ₹{invoice.amount.toFixed(2)}</TableCell>
              <TableCell> ₹{invoice.tax.toFixed(2)}</TableCell>
              <TableCell> ₹{invoice.totalAmount.toFixed(2)}</TableCell>
              <TableCell>
                <Badge
                  variant={
                    invoice.status === "PAID"
                      ? "default"
                      : invoice.status === "PENDING"
                      ? "neutral"
                      : "destructive"
                  }
                >
                  {invoice.status}
                </Badge>
              </TableCell>
              <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="mt-4 flex justify-between items-center">
        <p>
          Page {invoicesData.page} of {invoicesData.totalPages}
        </p>
        <div className="space-x-2">
          <Button
            variant="outline"
            disabled={invoicesData.page === 1}
            onClick={() => handlePageChange(invoicesData.page - 1)}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={invoicesData.page === invoicesData.totalPages}
            onClick={() => handlePageChange(invoicesData.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}