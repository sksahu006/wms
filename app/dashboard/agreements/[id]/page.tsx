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