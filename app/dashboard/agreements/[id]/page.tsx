import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Loader2, ArrowLeft, Download, FileText, ImageIcon } from 'lucide-react';
import { getAgreement } from '@/app/actions/aggrementActions/aggrements';
import { formatToUTCISOString } from '@/lib/formatToUTCISOString';

// Enable dynamic params for server-side rendering
export const dynamicParams = true;

// Set revalidation time for ISR
export const revalidate = 60;

export default async function AgreementPage({ params }: { params: { id: string } }) {
  const result = await getAgreement(params.id);

  if (!result.success || !result.agreement) {
    return (
      <div className="container mx-auto p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen flex items-center justify-center">
        <Card className="shadow-xl max-w-md w-full border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800">
          <CardContent className="pt-6 text-center">
            <p className="text-red-600 dark:text-red-400 font-semibold mb-4">{result.error || 'Agreement not found'}</p>
            <Link href="/dashboard/agreements">
              <Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white transition-colors">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agreements
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agreement = result.agreement;

  // Format dates for display
  const formatDate = (date: Date | null) =>
    date ? new Date(date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A';

  // Determine document type and rendering method
  const renderDocument = (documentUrl: string | null) => {
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
              alt="Agreement Document"
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
              title="Agreement PDF"
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
            <p className="text-gray-600 dark:text-gray-400 mb-4">Document type not supported for preview</p>
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
    <div className="container mx-auto p-6 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <Card className="shadow-2xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm max-w-5xl mx-auto">
        <CardHeader className="bg-blue-600 dark:bg-blue-800 text-white rounded-t-lg p-6">
          <div className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold tracking-tight">Agreement Details</CardTitle>
            <div className="space-x-3">
              <Link href="/dashboard/agreements">
                <Button className="bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agreements
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Agreement Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableBody>
                    {[
                      { label: 'Client Name', value: agreement.clientName || 'N/A' },
                      { label: 'Contact Person', value: agreement.contactPerson || 'N/A' },
                      { label: 'Space Type', value: agreement.spaceType },
                      { label: 'Area (sqft)', value: agreement.areaSqft },
                      {
                        label: 'Monthly Rate per sqft',
                        value: agreement.monthlyRatePerSqft
                          ? `₹${agreement.monthlyRatePerSqft.toFixed(2)}`
                          : 'N/A',
                      },
                      {
                        label: 'Monthly Rent Amount',
                        value: `₹${agreement.monthlyRentAmount.toFixed(2)}`,
                      },
                      { label: 'Handover Date', value: formatDate(agreement.handoverDate) },
                      { label: 'Rent Start Date', value: formatDate(agreement.rentStartDate) },
                      { label: 'Rate Escalation Date', value: formatDate(agreement.rateEscalationDate) },
                      {
                        label: 'Rate Escalation (%)',
                        value: agreement.rateEscalationPercent
                          ? `${agreement.rateEscalationPercent}%`
                          : 'N/A',
                      },
                      { label: 'Agreement Period (months)', value: agreement.agreementPeriod || 'N/A' },
                      {
                        label: 'Electricity Charges',
                        value: agreement.electricityCharges
                          ? `₹${agreement.electricityCharges.toFixed(2)}`
                          : 'N/A',
                      },
                      {
                        label: 'Water Charges',
                        value: agreement.waterCharges
                          ? `₹${agreement.waterCharges.toFixed(2)}`
                          : 'N/A',
                      },
                      { label: 'Status', value: agreement.status },
                      { label: 'Created At', value: formatDate(agreement.createdAt) },
                      { label: 'Remarks', value: agreement.remarks || 'N/A' },
                    ].map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900">
              <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">Related Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Table>
                  <TableBody>
                    {[
                      { label: 'Space Code', value: agreement.space.spaceCode },
                      { label: 'Space Name', value: agreement.space.name || 'N/A' },
                      { label: 'Warehouse ID', value: agreement.space.warehouseId },
                      { label: 'User ID', value: agreement.userId },
                      { label: 'User Name', value: agreement.user.name || 'N/A' },
                      { label: 'User Email', value: agreement.user.email || 'N/A' },
                    ].map((item, index) => (
                      <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <TableCell className="font-semibold text-gray-700 dark:text-gray-300">{item.label}</TableCell>
                        <TableCell className="text-gray-600 dark:text-gray-400">{item.value}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* New Document Section */}
          <Card className="mt-8 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-white dark:bg-gray-900">
            <CardHeader className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                <FileText className="mr-2 h-5 w-5" /> Agreement Document
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {renderDocument(agreement.documentUrl)}
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
  
}

// import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
// import Link from 'next/link';
// import { Loader2, ArrowLeft, Download, FileText, ImageIcon, ChevronDown, ChevronUp, Printer, Share2, Copy } from 'lucide-react';
// import { getAgreement } from '@/app/actions/aggrementActions/aggrements';
// import { formatToUTCISOString } from '@/lib/formatToUTCISOString';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { useState } from 'react';
// import { useToast } from '@/components/ui/use-toast';
// // import { CopyToClipboard } from 'react-copy-to-clipboard';

// // Enable dynamic params for server-side rendering
// export const dynamicParams = true;

// // Set revalidation time for ISR
// export const revalidate = 60;

// export default async function AgreementPage({ params }: { params: { id: string } }) {
//   const result = await getAgreement(params.id);

//   if (!result.success || !result.agreement) {
//     return (
//       <div className="container mx-auto p-6 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 min-h-screen flex items-center justify-center">
//         <Card className="shadow-2xl max-w-md w-full border-2 border-dashed border-red-300 dark:border-red-700 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm">
//           <CardContent className="pt-8 pb-6 px-6 text-center">
//             <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-6 w-6 text-red-600 dark:text-red-400"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                 />
//               </svg>
//             </div>
//             <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
//               {result.error || 'Agreement not found'}
//             </h3>
//             <p className="text-gray-600 dark:text-gray-400 mb-6">
//               The agreement you're looking for doesn't exist or you don't have permission to view it.
//             </p>
//             <Link href="/dashboard/agreements">
//               <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg transition-all hover:shadow-xl">
//                 <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agreements
//               </Button>
//             </Link>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   const agreement = result.agreement;

//   // Format dates for display
//   const formatDate = (date: Date | null) =>
//     date ? new Date(date).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A';

//   // Calculate agreement progress (time elapsed)
//   const calculateProgress = () => {
//     if (!agreement.rentStartDate || !agreement.agreementPeriod) return 0;
    
//     const startDate = new Date(agreement.rentStartDate);
//     const endDate = new Date(startDate);
//     endDate.setMonth(endDate.getMonth() + agreement.agreementPeriod);
//     const today = new Date();
    
//     if (today < startDate) return 0;
//     if (today > endDate) return 100;
    
//     const totalDuration = endDate.getTime() - startDate.getTime();
//     const elapsedDuration = today.getTime() - startDate.getTime();
//     return Math.round((elapsedDuration / totalDuration) * 100);
//   };

//   // Status badge color mapping
//   const statusColorMap: Record<string, string> = {
//     active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
//     pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
//     expired: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
//     draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
//     terminated: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
//   };

//   // Document preview component
//   const renderDocument = (documentUrl: string | null) => {
//     if (!documentUrl) {
//       return (
//         <div className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
//           <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
//           <p className="text-gray-500 dark:text-gray-400">No document available</p>
//         </div>
//       );
//     }

//     const fileExtension = documentUrl.split('.').pop()?.toLowerCase();
//     const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension || '');
//     const isPdf = fileExtension === 'pdf';

//     return (
//       <div className="mt-4">
//         {isImage && (
//           <div className="flex flex-col items-center">
//             <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
//               <img
//                 src={documentUrl}
//                 alt="Agreement Document"
//                 className="absolute inset-0 w-full h-full object-contain bg-white"
//               />
//             </div>
//             <div className="flex space-x-4 mt-6">
//               <a href={documentUrl} download>
//                 <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
//                   <Download className="mr-2 h-4 w-4" /> Download
//                 </Button>
//               </a>
//               <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30">
//                 <Share2 className="mr-2 h-4 w-4" /> Share
//               </Button>
//               <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-700">
//                 <Printer className="mr-2 h-4 w-4" /> Print
//               </Button>
//             </div>
//           </div>
//         )}
//         {isPdf && (
//           <div className="flex flex-col items-center">
//             <div className="w-full h-96 rounded-lg overflow-hidden shadow-lg bg-white">
//               <iframe
//                 src={`${documentUrl}#view=fitH`}
//                 className="w-full h-full border-0"
//                 title="Agreement PDF"
//               />
//             </div>
//             <div className="flex space-x-4 mt-6">
//               <a href={documentUrl} download>
//                 <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
//                   <Download className="mr-2 h-4 w-4" /> Download
//                 </Button>
//               </a>
//               <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30">
//                 <Share2 className="mr-2 h-4 w-4" /> Share
//                 </Button>
//               <Button variant="outline" className="border-gray-600 text-gray-600 hover:bg-gray-50 dark:border-gray-400 dark:text-gray-400 dark:hover:bg-gray-700">
//                 <Printer className="mr-2 h-4 w-4" /> Print
//               </Button>
//             </div>
//           </div>
//         )}
//         {!isImage && !isPdf && (
//           <div className="flex flex-col items-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
//             <FileText className="h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
//             <p className="text-gray-500 dark:text-gray-400 mb-6">Document type not supported for preview</p>
//             <div className="flex space-x-4">
//               <a href={documentUrl} download>
//                 <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
//                   <Download className="mr-2 h-4 w-4" /> Download
//                 </Button>
//               </a>
//               {/* <CopyToClipboard text={documentUrl}>
//                 <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30">
//                   <Copy className="mr-2 h-4 w-4" /> Copy Link
//                 </Button>
//               </CopyToClipboard> */}
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   };

//   return (
//     <div className="container mx-auto p-4 md:p-6 min-h-screen">
//       <div className="max-w-7xl mx-auto">
//         {/* Header with breadcrumbs */}
//         <div className="flex items-center justify-between mb-6">
//           <nav className="flex" aria-label="Breadcrumb">
//             <ol className="inline-flex items-center space-x-1 md:space-x-2">
//               <li className="inline-flex items-center">
//                 <Link href="/dashboard" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
//                   Dashboard
//                 </Link>
//               </li>
//               <li>
//                 <div className="flex items-center">
//                   <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
//                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
//                   </svg>
//                   <Link href="/dashboard/agreements" className="ml-1 text-sm font-medium text-gray-500 hover:text-blue-600 md:ml-2 dark:text-gray-400 dark:hover:text-white">
//                     Agreements
//                   </Link>
//                 </div>
//               </li>
//               <li aria-current="page">
//                 <div className="flex items-center">
//                   <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
//                     <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 9 4-4-4-4"/>
//                   </svg>
//                   <span className="ml-1 text-sm font-medium text-gray-700 md:ml-2 dark:text-gray-200">Details</span>
//                 </div>
//               </li>
//             </ol>
//           </nav>
          
//           <Link href="/dashboard/agreements">
//             <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
//               <ArrowLeft className="mr-2 h-4 w-4" /> Back to Agreements
//             </Button>
//           </Link>
//         </div>

//         {/* Main card */}
//         <Card className="shadow-2xl border-none bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 backdrop-blur-sm overflow-hidden">
//           {/* Card header with gradient */}
//           <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-800 dark:to-purple-800 text-white p-6">
//             <div className="flex flex-col md:flex-row md:items-center md:justify-between">
//               <div>
//                 <CardTitle className="text-2xl font-bold tracking-tight flex items-center">
//                   <FileText className="mr-3 h-6 w-6" />
//                   Agreement: {agreement.clientName || 'Untitled Agreement'}
//                 </CardTitle>
//                 <CardDescription className="text-indigo-100 dark:text-indigo-200 mt-1">
//                   ID: {agreement.id} • Created: {formatDate(agreement.createdAt)}
//                 </CardDescription>
//               </div>
//               <div className="mt-4 md:mt-0 flex space-x-3">
//                 <Badge className={`px-3 py-1 text-sm font-medium ${statusColorMap[agreement.status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}>
//                   {agreement.status}
//                 </Badge>
//                 <Button variant="ghost" className="text-white hover:bg-white/10">
//                   <Share2 className="mr-2 h-4 w-4" /> Share
//                 </Button>
//                 <Button variant="ghost" className="text-white hover:bg-white/10">
//                   <Printer className="mr-2 h-4 w-4" /> Print
//                 </Button>
//               </div>
//             </div>
//           </CardHeader>

//           <CardContent className="p-6">
//             {/* Agreement progress */}
//             <div className="mb-8">
//               <div className="flex justify-between items-center mb-2">
//                 <h3 className="font-medium text-gray-700 dark:text-gray-300">Agreement Progress</h3>
//                 <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{calculateProgress()}% completed</span>
//               </div>
//               <Progress value={calculateProgress()} className="h-2 bg-gray-200 dark:bg-gray-700" indicatorColor="bg-gradient-to-r from-indigo-500 to-purple-500" />
//               <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
//                 <span>Start: {formatDate(agreement.rentStartDate)}</span>
//                 <span>End: {agreement.rentStartDate && agreement.agreementPeriod ? 
//                   formatDate(new Date(new Date(agreement.rentStartDate).setMonth(new Date(agreement.rentStartDate).getMonth() + agreement.agreementPeriod))) : 
//                   'N/A'}</span>
//               </div>
//             </div>

//             {/* Two-column layout */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//               {/* Left column - Agreement details */}
//               <div className="lg:col-span-2 space-y-6">
//                 <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
//                   <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
//                     <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center justify-between">
//                       <span>Agreement Summary</span>
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-4">
//                     <Table>
//                       <TableBody>
//                         {[
//                           { label: 'Client Name', value: agreement.clientName || 'N/A' },
//                           { label: 'Contact Person', value: agreement.contactPerson || 'N/A' },
//                           { label: 'Space Type', value: agreement.spaceType },
//                           { label: 'Area (sqft)', value: agreement.areaSqft },
//                           {
//                             label: 'Monthly Rate per sqft',
//                             value: agreement.monthlyRatePerSqft
//                               ? `₹${agreement.monthlyRatePerSqft.toFixed(2)}`
//                               : 'N/A',
//                           },
//                           {
//                             label: 'Monthly Rent Amount',
//                             value: `₹${agreement.monthlyRentAmount.toFixed(2)}`,
//                           },
//                           { label: 'Handover Date', value: formatDate(agreement.handoverDate) },
//                           { label: 'Rent Start Date', value: formatDate(agreement.rentStartDate) },
//                           { label: 'Rate Escalation Date', value: formatDate(agreement.rateEscalationDate) },
//                           {
//                             label: 'Rate Escalation (%)',
//                             value: agreement.rateEscalationPercent
//                               ? `${agreement.rateEscalationPercent}%`
//                               : 'N/A',
//                           },
//                           { label: 'Agreement Period (months)', value: agreement.agreementPeriod || 'N/A' },
//                           {
//                             label: 'Electricity Charges',
//                             value: agreement.electricityCharges
//                               ? `₹${agreement.electricityCharges.toFixed(2)}`
//                               : 'N/A',
//                           },
//                           {
//                             label: 'Water Charges',
//                             value: agreement.waterCharges
//                               ? `₹${agreement.waterCharges.toFixed(2)}`
//                               : 'N/A',
//                           },
//                           { label: 'Remarks', value: agreement.remarks || 'N/A' },
//                         ].map((item, index) => (
//                           <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
//                             <TableCell className="font-medium text-gray-700 dark:text-gray-300 py-3">{item.label}</TableCell>
//                             <TableCell className="text-gray-600 dark:text-gray-400 py-3">{item.value}</TableCell>
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </CardContent>
//                 </Card>

//                 {/* Document preview section */}
//                 <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
//                   <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
//                     <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200 flex items-center">
//                       <FileText className="mr-2 h-5 w-5" /> Agreement Document
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-4">
//                     {renderDocument(agreement.documentUrl)}
//                   </CardContent>
//                 </Card>
//               </div>

//               {/* Right column - Related information */}
//               <div className="space-y-6">
//                 {/* Space information */}
//                 <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
//                   <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
//                     <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//                       Space Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-4">
//                     <div className="space-y-4">
//                       <div>
//                         <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm">Space Code</h4>
//                         <p className="text-gray-800 dark:text-gray-200">{agreement.space.spaceCode}</p>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm">Space Name</h4>
//                         <p className="text-gray-800 dark:text-gray-200">{agreement.space.name || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm">Warehouse ID</h4>
//                         <p className="text-gray-800 dark:text-gray-200">{agreement.space.warehouseId}</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* User information */}
//                 <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
//                   <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
//                     <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//                       User Information
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-4">
//                     <div className="space-y-4">
//                       <div>
//                         <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm">User ID</h4>
//                         <p className="text-gray-800 dark:text-gray-200">{agreement.userId}</p>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm">User Name</h4>
//                         <p className="text-gray-800 dark:text-gray-200">{agreement.user.name || 'N/A'}</p>
//                       </div>
//                       <div>
//                         <h4 className="font-medium text-gray-500 dark:text-gray-400 text-sm">User Email</h4>
//                         <p className="text-gray-800 dark:text-gray-200">{agreement.user.email || 'N/A'}</p>
//                       </div>
//                     </div>
//                   </CardContent>
//                 </Card>

//                 {/* Quick actions */}
//                 <Card className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow duration-300 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
//                   <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 p-4">
//                     <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
//                       Quick Actions
//                     </CardTitle>
//                   </CardHeader>
//                   <CardContent className="p-4">
//                     <div className="grid grid-cols-2 gap-3">
//                       <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-900/30">
//                         <Download className="mr-2 h-4 w-4" /> Download
//                       </Button>
//                       <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-50 dark:border-purple-400 dark:text-purple-400 dark:hover:bg-purple-900/30">
//                         <Share2 className="mr-2 h-4 w-4" /> Share
//                       </Button>
//                       <Button variant="outline" className="border-green-600 text-green-600 hover:bg-green-50 dark:border-green-400 dark:text-green-400 dark:hover:bg-green-900/30">
//                         <FileText className="mr-2 h-4 w-4" /> Generate Invoice
//                       </Button>
//                       <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50 dark:border-orange-400 dark:text-orange-400 dark:hover:bg-orange-900/30">
//                         <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                           <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
//                         </svg>
//                         Message
//                       </Button>
//                     </div>
//                   </CardContent>
//                 </Card>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }