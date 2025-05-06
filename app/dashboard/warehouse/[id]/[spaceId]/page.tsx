// app/dashboard/warehouse/[spaceId]/page.tsx
import { getSpaceById } from "@/app/actions/spaceActions/spaceActions"
import WarehouseSpaceDetailsClient from "./WarehouseSpaceDetailsClient"

interface Params {
  params: {
    id: string;
    spaceId: string;
  };
  searchParams?: Record<string, string>;
}

export default async function WarehouseSpaceDetailsPage({ params, searchParams }: Params) {
 

  const response = await getSpaceById(params.spaceId)

  if (!response.success || !response.data) {
    return <div className="p-6 text-center text-red-500">Space not found.</div>
  }

  return <WarehouseSpaceDetailsClient space={response.data} id={params.id} />
}
