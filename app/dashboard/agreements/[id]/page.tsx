import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import Link from 'next/link';
import { Loader2 } from 'lucide-react'; // Importing the Indian Rupee icon
import { getAgreement } from '@/app/actions/aggrementActions/aggrements';
import { formatToUTCISOString } from '@/lib/formatToUTCISOString';

// Enable dynamic params for server-side rendering
export const dynamicParams = true;  // Important for dynamic routes

// Set revalidation time for ISR (Incremental Static Regeneration)
export const revalidate = 60;  // ISR revalidation time in seconds (refresh every 60 seconds)

export default async function AgreementPage({ params }: { params: { id: string } }) {
  const result = await getAgreement(params.id);

  if (!result.success || !result.agreement) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-500">{result.error || 'Agreement not found'}</p>
            <Link href="/dashboard/agreements">
              <Button className="mt-4">Back to Agreements</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const agreement = result.agreement;

  // Format dates for display
  const formatDate = (date: Date | null) =>
    date ? formatToUTCISOString(new Date(date)) : 'N/A';

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Agreement Details </CardTitle>
          <div className="space-x-2">
            {/* <Link href={`/dashboard/agreements/${agreement.id}/edit`}>
              <Button>Edit Agreement</Button>
            </Link> */}
            <Link href="/dashboard/agreements">
              <Button >Back to Agreements</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Agreement Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Client Name</TableCell>
                      <TableCell>{agreement.clientName || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Contact Person</TableCell>
                      <TableCell>{agreement.contactPerson || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Space Type</TableCell>
                      <TableCell>{agreement.spaceType}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Area (sqft)</TableCell>
                      <TableCell>{agreement.areaSqft}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Monthly Rate per sqft</TableCell>
                      <TableCell>
                        {agreement.monthlyRatePerSqft
                          ? <>₹{agreement.monthlyRatePerSqft.toFixed(2)}</>
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Monthly Rent Amount</TableCell>
                      <TableCell>
                        <>₹{agreement.monthlyRentAmount.toFixed(2)}</>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Handover Date</TableCell>
                      <TableCell>{formatDate(agreement.handoverDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Rent Start Date</TableCell>
                      <TableCell>{formatDate(agreement.rentStartDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Rate Escalation Date</TableCell>
                      <TableCell>{formatDate(agreement.rateEscalationDate)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Rate Escalation (%)</TableCell>
                      <TableCell>
                        {agreement.rateEscalationPercent
                          ? `${agreement.rateEscalationPercent}%`
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Agreement Period (months)</TableCell>
                      <TableCell>{agreement.agreementPeriod || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Electricity Charges</TableCell>
                      <TableCell>
                        {agreement.electricityCharges
                          ? <>₹{agreement.electricityCharges.toFixed(2)}</>
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Water Charges</TableCell>
                      <TableCell>
                        {agreement.waterCharges
                          ? <>₹{agreement.waterCharges.toFixed(2)}</>
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Status</TableCell>
                      <TableCell>{agreement.status}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Created At</TableCell>
                      <TableCell>{formatDate(agreement.createdAt)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Remarks</TableCell>
                      <TableCell>{agreement.remarks || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Related Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-semibold">Space Code</TableCell>
                      <TableCell>{agreement.space.spaceCode}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Space Name</TableCell>
                      <TableCell>{agreement.space.name || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">Warehouse ID</TableCell>
                      <TableCell>{agreement.space.warehouseId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">User ID</TableCell>
                      <TableCell>{agreement.userId}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">User Name</TableCell>
                      <TableCell>{agreement.user.name || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-semibold">User Email</TableCell>
                      <TableCell>{agreement.user.email || 'N/A'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
