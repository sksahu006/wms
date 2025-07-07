"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { updateInvoice } from "@/app/actions/invoiceActions/invoice"
import { handleFileUpload } from "@/lib/handleFileUpload"

export default function EditInvoicePageClient({ invoice }: { invoice: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState(invoice.status)
  const [file, setFile] = useState<File | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Append fixed fields
    formData.append("id", invoice.id);
    formData.append("invoiceNumber", invoice.invoiceNumber);
    formData.append("clientId", invoice.client.id);
    formData.append("spaceId", invoice.space.id);
    formData.append("tds", invoice.tds);

    // Handle date
    formData.append("date", invoice.date ? new Date(invoice.date).toISOString() : new Date().toISOString());

    // Fix due date format
    const dueDateInput = formData.get("dueDate") as string;
    if (dueDateInput) {
      const dueDate = new Date(`${dueDateInput}T00:00:00Z`);
      formData.delete("dueDate");
      formData.append("dueDate", dueDate.toISOString());
    }

    // Handle amount, tax, totalAmount
    const amount = parseFloat(formData.get("amount") as string);
    if (invoice.tax) {
      const tax = invoice.tax;
      formData.append("tax", tax.toString());
      formData.append("totalAmount", (amount ).toString());
    } else {
      formData.append("totalAmount", amount.toString());
    }

    // Handle documentUrl
    if (file) {
      try {
        const uploadedUrl = await handleFileUpload(file);
        if (uploadedUrl) {
          formData.append("documentUrl", uploadedUrl);
        } else {
          formData.append("documentUrl", invoice.documentUrl || ""); // Fallback to existing or empty string
        }
      } catch (err) {
        toast.error("Failed to upload document");
        return;
      }
    } else {
      formData.append("documentUrl", invoice.documentUrl || ""); // Use existing documentUrl or empty string
    }

    // Submit update
    startTransition(async () => {
      try {
        console.log([...formData.entries()]); // Debug FormData contents
        const result = await updateInvoice(formData);
        if (!result.success) {
          throw new Error(result.error);
        }
        toast.success("Invoice updated successfully!");
        router.push("/dashboard/invoices");
      } catch (error) {
        console.error(error);
        toast.error(`Failed to update invoice: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    });
  }
  return (
    <div className="max-w-xl mx-auto py-10">
      <h1 className="text-2xl font-semibold mb-6">Edit Invoice</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Read-only fields */}
        <div className="space-y-2">
          <Label htmlFor="invoiceNumber">Invoice Number</Label>
          <Input id="invoiceNumber" value={invoice.invoiceNumber} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="client">Client</Label>
          <Input id="client" value={invoice.client.name ?? ""} disabled />
        </div>

        <div className="space-y-2">
          <Label htmlFor="space">Space</Label>
          <Input id="space" value={invoice.space.spaceCode} disabled />
        </div>

        {/* Editable Fields */}
        <div className="space-y-2">
          <Label htmlFor="tds">TDS</Label>
          <Input
            id="tds"
            name="tds"
            defaultValue={invoice.tds}
            type="number"
          // required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            name="amount"
            defaultValue={invoice.amount}
            type="number"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="dueDate">Due Date</Label>
          <Input
            id="dueDate"
            name="dueDate"
            defaultValue={
              invoice.dueDate
                ? new Date(invoice.dueDate).toISOString().split("T")[0]
                : ""
            }
            type="date"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          {/* {invoice.status === "PAID" ? (
            <div>
              <Input id="status" value="PAID" disabled />
              <p className="text-sm text-muted-foreground">
                Paid invoices cannot be changed to unpaid status.
              </p>
            </div>
          ) : ( */}
          <>
            <Select value={status} onValueChange={setStatus} name="status">
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                {/* <SelectItem value="CANCELLED">Cancelled</SelectItem> */}
              </SelectContent>
            </Select>
            <input type="hidden" name="status" value={status} />
          </>
          {/* )} */}
        </div>

        <div className="space-y-2">
          <Label htmlFor="document">Upload New Document (optional)</Label>
          <Input
            id="document"
            type="file"
            accept="application/pdf,image/*"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Updating..." : "Update Invoice"}
        </Button>
      </form>
    </div>
  )
}
