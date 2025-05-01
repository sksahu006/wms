import AddInvoiceForm from "./AddInvoiceFrom";


export default function AddInvoicePage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Create New Invoice</h1>
      <AddInvoiceForm />
    </div>
  );
}