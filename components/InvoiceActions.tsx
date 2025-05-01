"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { deleteInvoice, updateInvoice } from "@/app/actions/invoiceActions/invoice";

interface InvoiceActionsProps {
  invoice: { id: string; status: string };
  tab: string;
}

export default function InvoiceActions({ invoice, tab }: InvoiceActionsProps) {
  const router = useRouter();

  const handleMarkAsPaid = async () => {
    const formData = new FormData();
    formData.append("id", invoice.id);
    formData.append("status", "PAID");
    const result = await updateInvoice(formData);
    if (result.success) {
      router.refresh(); // Refresh the page
    }
  };

  const handleDelete = async () => {
    const result = await deleteInvoice(invoice.id);
    if (result.success) {
      router.refresh();
    }
  };

  return (
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
          <Link href={`/dashboard/invoices/${invoice.id}`}>View invoice</Link>
        </DropdownMenuItem>
        <DropdownMenuItem>Download PDF</DropdownMenuItem>
        <DropdownMenuSeparator />
        {invoice.status !== "PAID" && (
          <>
            <DropdownMenuItem onClick={handleMarkAsPaid} className="text-green-600">
              Mark as paid
            </DropdownMenuItem>
            <DropdownMenuItem>Send reminder</DropdownMenuItem>
          </>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/invoices/edit/${invoice.id}`}>Edit invoice</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
          Delete invoice
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}