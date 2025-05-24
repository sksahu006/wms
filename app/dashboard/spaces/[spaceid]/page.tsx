// app/dashboard/warehouse/[spaceId]/page.tsx
import { getSpaceById } from "@/app/actions/spaceActions/spaceActions"

import SingleSpace from "./SingleSpace";


interface Params {
    params: {
        
        spaceid: string;
    };
    searchParams?: Record<string, string>;
}

export default async function WarehouseSpaceDetailsPage({ params, searchParams }: Params) {


    const response = await getSpaceById(params?.spaceid)
    console.log(response, "response")
    if (!response.success || !response.data) {
        return <div className="p-6 text-center text-red-500">Space not found.</div>
    }

    return <SingleSpace space={response.data} id={params?.spaceid} />
}
