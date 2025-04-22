import { getWarehouseSpaces } from "@/app/actions/spaceActions/spaceActions";
import ClientWarehousePage from "./ClientWarehousePage";
import { SpaceStatus } from "@prisma/client";

interface Params {
  params: { id: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function WarehouseSpace({ params, searchParams }: Params) {
  const { id: warehouseId } = params;

  const page = parseInt(searchParams.page || "1", 10);
  const limit = parseInt(searchParams.limit || "10", 10);
  const tab = searchParams.tab || "all";
  const search = searchParams.search || "";

  let status: SpaceStatus | undefined;
  if (tab === "occupied") status = "OCCUPIED";
  if (tab === "vacant") status = "AVAILABLE";

  const response = await getWarehouseSpaces({
    warehouseId,
    page,
    limit,
    status,
    ...(tab === "cold" && { type: "Cold Storage" }),
  });

  const initialSpaces = response.success ? response.data : null;

  return (
    <ClientWarehousePage
      warehouseId={warehouseId}
      initialSpaces={initialSpaces}
      tab={tab}
      page={page}
      limit={limit}
      search={search}
    />
  );
}
