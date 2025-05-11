'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoice } from '@/app/actions/invoiceActions/invoice';
import { InvoiceStatus } from '@prisma/client';
import { FileText, User, Building, IndianRupee, Calendar, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { formatToUTCISOString } from '@/lib/formatToUTCISOString';

interface InvoiceResponse {
  success: boolean;
  data?: {
    id: string;
    invoiceNumber: string;
    amount: number;
    tax: number;
    totalAmount: number;
    date: Date;
    documentUrl?: string | null;
    dueDate: Date;
    status: InvoiceStatus;
    client: { id: string; name: string | null };
    space: { id: string; spaceCode: string };
  };
  error?: string;
}

export default function InvoiceDetailsPage() {
  const params = useParams();
  const invoiceId = params.id as string;
  const [invoice, setInvoice] = useState<InvoiceResponse['data'] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInvoice() {
      if (!invoiceId) {
        setError('No invoice ID provided');
        setLoading(false);
        return;
      }

      const response = await getInvoice(invoiceId);
      if (response.success && response.data) {
        setInvoice(response.data);
      } else {
        setError(response.error || 'Failed to load invoice');
      }
      setLoading(false);
    }

    fetchInvoice();
  }, [invoiceId]);

  const downloadPDF = async () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const element = document.getElementById('invoice-content');
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const imgWidth = 190;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 10;

    pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + 10;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`invoice_${invoice?.invoiceNumber}.pdf`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-12 w-1/2 mb-6" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive" className="rounded-lg">
          <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
          <AlertDescription>{error || 'Invoice not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderDocument = (documentUrl: string | null | undefined) => {
    if (!documentUrl) {
      return <p className="text-gray-600 dark:text-gray-400">No document available</p>;
    }

    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '');
    const isPdf = fileExtension === 'pdf';

    return (
      <div className="mt-4">
        {isImage && (
          <div className="flex flex-col items-center">
            <img
              src={documentUrl}
              alt="Invoice Document"
              className="max-w-full h-auto rounded-lg shadow-md"
              style={{ maxHeight: '500px' }}
            />
            <a href={documentUrl} download className="mt-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" /> Download Image
              </Button>
            </a>
          </div>
        )}
        {isPdf && (
          <div className="flex flex-col items-center">
            <iframe
              src={documentUrl}
              className="w-full h-[500px] border rounded-lg shadow-md"
              title="Invoice PDF"
            />
            <a href={documentUrl} download className="mt-4">
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" /> Download PDF
              </Button>
            </a>
          </div>
        )}
        {!isImage && !isPdf && (
          <div className="flex flex-col items-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Document type not supported for preview
            </p>
            <a href={documentUrl} download>
              <Button className="bg-green-600 hover:bg-green-700 text-white">
                <Download className="mr-2 h-4 w-4" /> Download Document
              </Button>
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl  min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-3">

        </div>
        <Button
          onClick={downloadPDF}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2 flex items-center"
        >
          <Download className="h-5 w-5 mr-2" />
          Download PDF
        </Button>
      </div>
      <Card id="invoice-content" className="border-none shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <FileText className="h-8 w-8 mr-3" />
                Invoice #{invoice.invoiceNumber}
              </h2>
              <p className="text-sm mt-1 opacity-80">Thank you for your business</p>
            </div>
            <div className="text-sm">
              <p>
                Status:{' '}
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${invoice.status === 'PAID'
                    ? 'bg-green-200 text-green-800'
                    : 'bg-red-200 text-red-800'
                    }`}
                >
                  {invoice.status}
                </span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <User className="h-5 w-5 mr-2 text-indigo-600" />
                Client Details
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {invoice.client.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Client ID:</span> {invoice.client.id}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Building className="h-5 w-5 mr-2 text-indigo-600" />
                Space Details
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Space Code:</span> {invoice.space.spaceCode}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Space ID:</span> {invoice.space.id}
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <IndianRupee className="h-5 w-5 mr-2 text-indigo-600" />
                Invoice Details
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Amount:</span> ₹{invoice.amount.toFixed(2)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Tax:</span> ₹{invoice.tax.toFixed(2)}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Total Amount:</span>{' '}
                <span className="text-indigo-600 font-semibold">
                  ₹{invoice.totalAmount.toFixed(2)}
                </span>
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                Dates
              </h3>
              <p className="text-gray-600">
                <span className="font-medium">Issued:</span>{' '}
                {new Date(invoice.date).toLocaleDateString('en-IN', { dateStyle: "medium" })}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Due:</span>{' '}
                {new Date(invoice.dueDate).toLocaleDateString('en-IN', { dateStyle: "medium" })}
              </p>
            </div>
          </div>
          <div className="border-t pt-6 text-gray-600">
            <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
            <p className="text-sm">
              <span className="font-medium">Note:</span> This invoice is generated by Your
              Company. For any queries, please reach out to our support team.
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Contact:</span> support@yourcompany.com | +91
              123-456-7890
            </p>
            <p className="text-sm mt-2">
              <span className="font-medium">Address:</span> 123 Business Avenue, Suite 100,
              Mumbai, India
            </p>
          </div>
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
      <Card className="mt-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900">
        <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Invoice Document
          </h2>
        </CardHeader>
        <CardContent className="p-6">
          {renderDocument(invoice.documentUrl)}
        </CardContent>
      </Card>
    </div>
  );
}