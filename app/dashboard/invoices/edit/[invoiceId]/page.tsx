// edit-invoice/page.tsx
import { getInvoice } from "@/app/actions/invoiceActions/invoice"

import { notFound } from "next/navigation"
import EditInvoicePageClient from "./EditInvoiceClient"

export const metadata = {
  title: "Edit Invoice",
}

export default async function EditInvoicePage({ params }: { params: { invoiceId: string } }) {
  const result = await getInvoice(params.invoiceId)
  if (!result.success || !result.data) return notFound()

  return <EditInvoicePageClient invoice={result.data} />
}
