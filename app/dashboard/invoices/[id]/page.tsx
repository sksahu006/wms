// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams } from 'next/navigation';
// import { Card, CardContent, CardHeader } from '@/components/ui/card';
// import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
// import { Skeleton } from '@/components/ui/skeleton';
// import { getInvoice } from '@/app/actions/invoiceActions/invoice';
// import { InvoiceStatus } from '@prisma/client';
// import { FileText, User, Building, IndianRupee, Calendar, Download } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import jsPDF from 'jspdf';
// import html2canvas from 'html2canvas';
// import { formatToUTCISOString } from '@/lib/formatToUTCISOString';

// interface InvoiceResponse {
//   success: boolean;
//   data?: {
//     id: string;
//     invoiceNumber: string;
//     amount: number;
//     tax: number;
//     totalAmount: number;
//     date: Date;
//     documentUrl?: string | null;
//     dueDate: Date;
//     status: InvoiceStatus;
//     client: { id: string; name: string | null };
//     space: { id: string; spaceCode: string };
//   };
//   error?: string;
// }

// export default function InvoiceDetailsPage() {
//   const params = useParams();
//   const invoiceId = params.id as string;
//   const [invoice, setInvoice] = useState<InvoiceResponse['data'] | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchInvoice() {
//       if (!invoiceId) {
//         setError('No invoice ID provided');
//         setLoading(false);
//         return;
//       }

//       const response = await getInvoice(invoiceId);
//       if (response.success && response.data) {
//         setInvoice(response.data);
//       } else {
//         setError(response.error || 'Failed to load invoice');
//       }
//       setLoading(false);
//     }

//     fetchInvoice();
//   }, [invoiceId]);

//   const downloadPDF = async () => {
//     const pdf = new jsPDF('p', 'mm', 'a4');
//     const element = document.getElementById('invoice-content');
//     if (!element) return;

//     const canvas = await html2canvas(element, { scale: 2 });
//     const imgData = canvas.toDataURL('image/png');
//     const imgWidth = 190;
//     const pageHeight = 295;
//     const imgHeight = (canvas.height * imgWidth) / canvas.width;
//     let heightLeft = imgHeight;

//     let position = 10;

//     pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//     heightLeft -= pageHeight;

//     while (heightLeft >= 0) {
//       position = heightLeft - imgHeight + 10;
//       pdf.addPage();
//       pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
//       heightLeft -= pageHeight;
//     }

//     pdf.save(`invoice_${invoice?.invoiceNumber}.pdf`);
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto p-6 max-w-4xl">
//         <Skeleton className="h-12 w-1/2 mb-6" />
//         <Skeleton className="h-96 w-full rounded-lg" />
//       </div>
//     );
//   }

//   if (error || !invoice) {
//     return (
//       <div className="container mx-auto p-6 max-w-4xl">
//         <Alert variant="destructive" className="rounded-lg">
//           <AlertTitle className="text-lg font-semibold">Error</AlertTitle>
//           <AlertDescription>{error || 'Invoice not found'}</AlertDescription>
//         </Alert>
//       </div>
//     );
//   }

//   const renderDocument = (documentUrl: string | null | undefined) => {
//     if (!documentUrl) {
//       return <p className="text-gray-600 dark:text-gray-400">No document available</p>;
//     }

//     const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
//     const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '');
//     const isPdf = fileExtension === 'pdf';

//     return (
//       <div className="mt-4">
//         {isImage && (
//           <div className="flex flex-col items-center">
//             <img
//               src={documentUrl}
//               alt="Invoice Document"
//               className="max-w-full h-auto rounded-lg shadow-md"
//               style={{ maxHeight: '500px' }}
//             />
//             <a href={documentUrl} download className="mt-4">
//               <Button className="bg-green-600 hover:bg-green-700 text-white">
//                 <Download className="mr-2 h-4 w-4" /> Download Image
//               </Button>
//             </a>
//           </div>
//         )}
//         {isPdf && (
//           <div className="flex flex-col items-center">
//             <iframe
//               src={documentUrl}
//               className="w-full h-[500px] border rounded-lg shadow-md"
//               title="Invoice PDF"
//             />
//             <a href={documentUrl} download className="mt-4">
//               <Button className="bg-green-600 hover:bg-green-700 text-white">
//                 <Download className="mr-2 h-4 w-4" /> Download PDF
//               </Button>
//             </a>
//           </div>
//         )}
//         {!isImage && !isPdf && (
//           <div className="flex flex-col items-center">
//             <p className="text-gray-600 dark:text-gray-400 mb-4">
//               Document type not supported for preview
//             </p>
//             <a href={documentUrl} download>
//               <Button className="bg-green-600 hover:bg-green-700 text-white">
//                 <Download className="mr-2 h-4 w-4" /> Download Document
//               </Button>
//             </a>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto p-6 max-w-4xl  min-h-screen">
//       <div className="flex justify-between items-center mb-6">
//         <div className="flex items-center space-x-3">

//         </div>
//         <Button
//           onClick={downloadPDF}
//           className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg px-4 py-2 flex items-center"
//         >
//           <Download className="h-5 w-5 mr-2" />
//           Download PDF
//         </Button>
//       </div>
//       <Card id="invoice-content" className="border-none shadow-xl rounded-xl overflow-hidden">
//         <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-500 text-white p-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h2 className="text-3xl font-bold flex items-center">
//                 <FileText className="h-8 w-8 mr-3" />
//                 Invoice #{invoice.invoiceNumber}
//               </h2>
//               <p className="text-sm mt-1 opacity-80">Thank you for your business</p>
//             </div>
//             <div className="text-sm">
//               <p>
//                 Status:{' '}
//                 <span
//                   className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${invoice.status === 'PAID'
//                     ? 'bg-green-200 text-green-800'
//                     : 'bg-red-200 text-red-800'
//                     }`}
//                 >
//                   {invoice.status}
//                 </span>
//               </p>
//             </div>
//           </div>
//         </CardHeader>
//         <CardContent className="p-8 bg-white">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <User className="h-5 w-5 mr-2 text-indigo-600" />
//                 Client Details
//               </h3>
//               <p className="text-gray-600">
//                 <span className="font-medium">Name:</span> {invoice.client.name}
//               </p>
//               <p className="text-gray-600">
//                 <span className="font-medium">Client ID:</span> {invoice.client.id}
//               </p>
//             </div>
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <Building className="h-5 w-5 mr-2 text-indigo-600" />
//                 Space Details
//               </h3>
//               <p className="text-gray-600">
//                 <span className="font-medium">Space Code:</span> {invoice.space.spaceCode}
//               </p>
//               <p className="text-gray-600">
//                 <span className="font-medium">Space ID:</span> {invoice.space.id}
//               </p>
//             </div>
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <IndianRupee className="h-5 w-5 mr-2 text-indigo-600" />
//                 Invoice Details
//               </h3>
//               <p className="text-gray-600">
//                 <span className="font-medium">Amount:</span> ₹{invoice.amount.toFixed(2)}
//               </p>
//               <p className="text-gray-600">
//                 <span className="font-medium">Tax:</span> ₹{invoice.tax.toFixed(2)}
//               </p>
//               <p className="text-gray-600">
//                 <span className="font-medium">Total Amount:</span>{' '}
//                 <span className="text-indigo-600 font-semibold">
//                   ₹{invoice.totalAmount.toFixed(2)}
//                 </span>
//               </p>
//             </div>
//             <div className="space-y-4">
//               <h3 className="text-lg font-semibold text-gray-800 flex items-center">
//                 <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
//                 Dates
//               </h3>
//               <p className="text-gray-600">
//                 <span className="font-medium">Issued:</span>{' '}
//                 {new Date(invoice.date).toLocaleDateString('en-IN', { dateStyle: "medium" })}
//               </p>
//               <p className="text-gray-600">
//                 <span className="font-medium">Due:</span>{' '}
//                 {new Date(invoice.dueDate).toLocaleDateString('en-IN', { dateStyle: "medium" })}
//               </p>
//             </div>
//           </div>
//           <div className="border-t pt-6 text-gray-600">
//             <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
//             <p className="text-sm">
//               <span className="font-medium">Note:</span> This invoice is generated by Your
//               Company. For any queries, please reach out to our support team.
//             </p>
//             <p className="text-sm mt-2">
//               <span className="font-medium">Contact:</span> support@yourcompany.com | +91
//               123-456-7890
//             </p>
//             <p className="text-sm mt-2">
//               <span className="font-medium">Address:</span> 123 Business Avenue, Suite 100,
//               Mumbai, India
//             </p>
//           </div>
//         </CardContent>
//       </Card>
//       <footer className="mt-8 text-center text-gray-500 text-sm">
//         <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
//       </footer>
//       <Card className="mt-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900">
//         <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
//             <FileText className="mr-2 h-5 w-5" /> Invoice Document
//           </h2>
//         </CardHeader>
//         <CardContent className="p-6">
//           {renderDocument(invoice.documentUrl)}
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { getInvoice, markInvoiceAsPaid } from '@/app/actions/invoiceActions/invoice';
import { InvoiceStatus } from '@prisma/client';
import { FileText, User, Building, IndianRupee, Calendar, Download, Share2, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

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
    tds?: number | null;
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
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session, status } = useSession()
  const isAdmin = session?.user?.role === 'ADMIN'

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
    toast.success("Download started", {
      description: "Your invoice PDF is being downloaded",
    });
  };

  const shareInvoice = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Invoice #${invoice?.invoiceNumber}`,
          text: `Check out this invoice for ${invoice?.client.name}`,
          url: window.location.href,
        });
      } else {
        toast.info("Sharing not supported", {
          description: "Web Share API not supported in your browser",
        });
      }
    } catch (err) {
      toast.error("Error sharing", {
        description: "Could not share the invoice",
      });
    }
  };

  const calculateDueDays = () => {
    if (!invoice) return 0;
    const dueDate = new Date(invoice.dueDate);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const statusColorMap: Record<string, string> = {
    PAID: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    UNPAID: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    OVERDUE: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    CANCELLED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  const renderDocument = (documentUrl: string | null | undefined) => {
    if (!documentUrl) {
      return (
        <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No document available</p>
        </div>
      );
    }

    const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
    const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '');
    const isPdf = fileExtension === 'pdf';

    return (
      <div className="mt-4">
        {isImage && (
          <div className="flex flex-col items-center">
            <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
              <img
                src={documentUrl}
                alt="Invoice Document"
                className="absolute inset-0 w-full h-full object-contain bg-white"
                loading="lazy"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <a href={documentUrl} download>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={shareInvoice}
                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        )}
        {isPdf && (
          <div className="flex flex-col items-center">
            <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg bg-white">
              <iframe
                src={`${documentUrl}#view=fitH`}
                className="w-full h-full border-0"
                title="Invoice PDF"
                loading="lazy"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <a href={documentUrl} download>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={shareInvoice}
                className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30"
              >
                <Share2 className="mr-2 h-4 w-4" /> Share
              </Button>
            </div>
          </div>
        )}
        {!isImage && !isPdf && (
          <div className="flex flex-col items-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-6">Document type not supported for preview</p>
            <div className="flex space-x-4">
              <a href={documentUrl} download>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Alert variant="destructive" className="rounded-lg border-red-300 dark:border-red-700">
          <AlertTitle className="text-lg font-semibold flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Error loading invoice
          </AlertTitle>
          <AlertDescription className="mt-2">
            {error || 'The requested invoice could not be found. Please check the invoice ID and try again.'}
          </AlertDescription>
          <Link href="/dashboard/invoices">
            <Button variant="outline" className="mt-4 border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Invoices
            </Button>
          </Link>
        </Alert>
      </div>
    );
  }

  const dueDays = calculateDueDays();
  const isOverdue = dueDays < 0;

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-6xl min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-2">
            <li className="inline-flex items-center">
              <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                Dashboard
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                </svg>
                <Link href="/dashboard/invoices" className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">
                  Invoices
                </Link>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4" />
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2 dark:text-gray-200">Details</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="flex space-x-3">
          <Button
            onClick={downloadPDF}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <Download className="h-5 w-5 mr-2" />
            Download PDF
          </Button>
          <Button
            variant="outline"
            onClick={shareInvoice}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Share2 className="h-5 w-5 mr-2" />
            Share
          </Button>
        </div>
      </div>

      <Card id="invoice-content" className="border-none shadow-2xl rounded-xl overflow-hidden bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight flex items-center">
                <FileText className="h-6 w-6 md:h-8 md:w-8 mr-3" />
                Invoice #{invoice.invoiceNumber}
              </CardTitle>
              <CardDescription className="text-indigo-100 dark:text-indigo-200 mt-1">
                Issued: {new Date(invoice.date).toLocaleDateString('en-IN', { dateStyle: "medium" })}
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              <Badge className={`px-3 py-1 text-sm font-medium ${statusColorMap[invoice.status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
                {invoice.status}
              </Badge>
              <div className="text-right">
                <p className="text-sm text-indigo-100">Total Amount</p>
                <p className="text-2xl font-bold">₹{invoice.totalAmount.toFixed(2)}</p>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {invoice.status !== 'PAID' && (
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-700 dark:text-gray-300">
                  {isOverdue ? (
                    <span className="text-red-600 dark:text-red-400">Overdue by {Math.abs(dueDays)} days</span>
                  ) : (
                    <span>Due in {dueDays} days</span>
                  )}
                </h3>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Due: {new Date(invoice.dueDate).toLocaleDateString('en-IN', { dateStyle: "medium" })}
                </span>
              </div>
              <Progress
                value={isOverdue ? 100 : (dueDays / 30) * 100}
                className={`h-2 bg-gray-200 dark:bg-blue-700 ${isOverdue
                  ? "[&>div]:bg-red-500"
                  : "[&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-indigo-500"
                  }`}
              />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <User className="h-5 w-5 mr-2 text-indigo-600" />
                      Client Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{invoice.client.name || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Client ID</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{invoice.client.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                  <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                    <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                      <Building className="h-5 w-5 mr-2 text-indigo-600" />
                      Space Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Space Code</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{invoice.space.spaceCode}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Space ID</p>
                        <p className="text-gray-800 dark:text-gray-200 font-medium">{invoice.space.id}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
                    <span className="flex items-center">
                      <IndianRupee className="h-5 w-5 mr-2 text-indigo-600" />
                      Invoice Breakdown
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      onClick={() => setIsExpanded(!isExpanded)}
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" /> Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" /> Show
                        </>
                      )}
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className={`p-4 ${isExpanded ? 'block' : 'hidden'}`}>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <p className="text-gray-600 dark:text-gray-400">Subtotal</p>
                      <p className="text-gray-800 dark:text-gray-200">₹{invoice.amount.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-600 dark:text-gray-400">Tax ({invoice.tax > 0 ? ((invoice.tax / invoice.amount) * 100).toFixed(2) : '0'}%)</p>
                      <p className="text-gray-800 dark:text-gray-200">₹{invoice.tax.toFixed(2)}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="text-gray-800 dark:text-gray-200">₹{(invoice.tds ?? 0).toFixed(2)}</p>
                      <p className="text-gray-800 dark:text-gray-200">₹{invoice.tds?.toFixed(2)}</p>
                    </div>
                    <div className="border-t pt-4 flex justify-between">
                      <p className="text-gray-800 dark:text-gray-200 font-semibold">Total</p>
                      <p className="text-indigo-600 dark:text-indigo-400 font-bold text-lg">₹{invoice.totalAmount.toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                    <FileText className="mr-2 h-5 w-5" /> Invoice Document
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {renderDocument(invoice.documentUrl)}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {isAdmin && <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Payment Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <form action={async () => {
                      if (!invoice) return;
                      const result = await markInvoiceAsPaid(invoice.id);
                      if (result.success) {
                        toast.success("Invoice marked as paid!");
                        const response = await getInvoice(invoice.id);
                        if (response.success) {
                          setInvoice(response.data);
                        }
                      } else {
                        toast.error(result.error || "Failed to mark invoice as paid");
                      }
                    }}>
                      <Button
                        type="submit"
                        className={`w-full bg-gradient-to-r from-green-600 ${invoice?.status === "PAID" ? "hover" : " "} to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white`}
                        disabled={invoice?.status === "PAID"}
                      >
                        {invoice?.status === "PAID" ? "Already Paid" : "Mark as Paid"}
                      </Button>
                    </form>
                    {invoice?.status !== "PAID" && <><Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30"
                      onClick={() => {
                        toast.info("Reminder sent to client");
                      }}
                    >
                      Send Reminder
                    </Button>
                      <Button
                        variant="outline"
                        className="w-full border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30"
                        onClick={() => {
                          toast.info("Receipt generated");
                        }}
                      >
                        Generate Receipt
                      </Button>

                    </>}
                  </div>
                </CardContent>
              </Card>}

              {/* <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Company Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</p>
                      <p className="text-gray-800 dark:text-gray-200">Your Company</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tax ID</p>
                      <p className="text-gray-800 dark:text-gray-200">GSTIN123456789</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                      <p className="text-gray-800 dark:text-gray-200">accounts@yourcompany.com</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</p>
                      <p className="text-gray-800 dark:text-gray-200">+91 123-456-7890</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</p>
                      <p className="text-gray-800 dark:text-gray-200">123 Business Avenue, Suite 100, Mumbai, India</p>
                    </div>
                  </div>
                </CardContent>
              </Card> */}

              {isAdmin && <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
                  <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    This invoice is generated by SCPL warehouse. For any queries, please reach out to our support team.
                  </p>
                </CardContent>
              </Card>}
            </div>
          </div>
        </CardContent>
      </Card>

      <footer className="mt-8 text-center text-gray-500 text-sm">
        <p>Invoice ID: {invoice.id} • &copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
      </footer>
    </div>
  );
}