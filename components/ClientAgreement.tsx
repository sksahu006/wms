
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import Link from "next/link";
import { getAgreementsByUser } from "@/app/actions/aggrementActions/aggrements";

export default async function Agreements({ clientId, searchParams }: { clientId: string; searchParams: { page?: string } }) {
  const page = parseInt(searchParams?.page || "1" );
  const limit = 10;
  const skip = (page - 1) * limit;


  // Fetch the agreements for the client with pagination
  const response = await getAgreementsByUser( clientId, page, limit );
    console.log(response)
  if (!response.success) {
    return <div>Error: {response.error}</div>;
  }

  if (!response?.agreements) {
    return <div>Error: Invalid response data</div>;
  }

  const  agreements = response?.agreements;

  return (
    <div>
      {/* Client's Agreements Table */}
      <Table>
        <TableHeader >
          <TableRow className="bg-blue-900">
            <TableHead className='text-white'>Agreement ID</TableHead>
            <TableHead className='text-white'>Client Name</TableHead>
            <TableHead className='text-white'>Space Type</TableHead>
            <TableHead className='text-white'>Area (sqft)</TableHead>
            <TableHead className='text-white'>Monthly Rent</TableHead>
            <TableHead className='text-white'>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {agreements.length > 0 ? (
            agreements.map((agreement: any) => (
              <TableRow key={agreement.id}>
                <TableCell className="font-medium">{agreement.id}</TableCell>
                <TableCell>{agreement.clientName}</TableCell>
                <TableCell>{agreement.spaceType}</TableCell>
                <TableCell>{agreement.areaSqft}</TableCell>
                <TableCell>{agreement.monthlyRentAmount}</TableCell>
                <TableCell>
                  <Badge
                    variant={agreement.status === "ACTIVE" ? "default" : "outline"}
                    className={agreement.status === "ACTIVE" ? "bg-green-500" : "border-yellow-500"}
                  >
                    {agreement.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                No agreements found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {/* <div className="pagination mt-4 flex gap-4 items-center">
        <Link
          href={`?page=${page - 1}`}
          className={`btn-prev ${page === 1 ? "pointer-events-none opacity-50" : ""}`}
        >
          Previous
        </Link>
        <span>{`Page ${page} of ${totalPages}`}</span>
        <Link
          href={`?page=${page + 1}`}
          className={`btn-next ${page === totalPages ? "pointer-events-none opacity-50" : ""}`}
        >
          Next
        </Link>
      </div> */}
    </div>
  );
}
