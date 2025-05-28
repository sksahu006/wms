"use server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
    SpaceStatus,
    SpaceType,
    InvoiceStatus,
    Status,
    SupportStatus
} from "@prisma/client";

// Simplified input schemas
const ReportInputSchema = z.object({
    reportType: z.enum([
        "SPACE_OCCUPANCY",
        "REVENUE",
        "AGREEMENT_STATUS",
        "SUPPORT_TICKET",
        "WAREHOUSE_CAPACITY",
        "CLIENT_ACTIVITY",
        "INVOICE_AGING",
        "SPACE_UTILIZATION",
    ]),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    filters: z.record(z.any()).optional().default({}),
});

type ReportInput = z.infer<typeof ReportInputSchema>;
type Filters = Record<string, any>;

// Utility function to build date filter
function buildDateFilter(startDate?: string, endDate?: string) {
    if (!startDate || !endDate) return {};

    return {
        createdAt: {
            gte: new Date(startDate),
            lte: new Date(endDate),
        }
    };
}

// Utility function to safely get array filters
function getArrayFilter<T>(filters: Filters, key: string): T[] | undefined {
    const value = filters[key];
    // If 'all' is selected or included in array, return undefined to skip filtering
    if (value === 'all' || (Array.isArray(value) && value.includes('all'))) {
        return undefined;
    }
    return Array.isArray(value) ? value : undefined;
}

// Utility function to safely get single filter value
function getSingleFilter<T>(filters: Filters, key: string): T | undefined {
    const value = filters[key];
    // If 'all' is selected, return undefined to skip filtering
    if (value === 'all') {
        return undefined;
    }
    return value;
}

// Report handlers
class ReportHandlers {
    static async spaceOccupancy(dateFilter: any, filters: Filters) {
        return prisma.space.groupBy({
            by: ["status", "warehouseId"],
            where: {
                ...dateFilter,
                ...(getArrayFilter<SpaceStatus>(filters, "status") && {
                    status: { in: getArrayFilter<SpaceStatus>(filters, "status")! }
                }),
                ...(getArrayFilter<SpaceType>(filters, "type") && {
                    type: { in: getArrayFilter<SpaceType>(filters, "type")! }
                }),
                ...(getSingleFilter<string>(filters, "warehouseId") && {
                    warehouseId: getSingleFilter<string>(filters, "warehouseId")!
                }),
            },
            _count: { id: true },
        });
    }

    static async revenue(dateFilter: any, filters: Filters) {
        return prisma.invoice.groupBy({
            by: ["status", "clientId"],
            where: {
                ...dateFilter,
                ...(getArrayFilter<InvoiceStatus>(filters, "status") && {
                    status: { in: getArrayFilter<InvoiceStatus>(filters, "status")! }
                }),
                ...(getSingleFilter<string>(filters, "clientId") && {
                    clientId: getSingleFilter<string>(filters, "clientId")!
                }),
                ...(getSingleFilter<string>(filters, "warehouseId") && {
                    space: { warehouseId: getSingleFilter<string>(filters, "warehouseId")! }
                }),
            },
            _sum: { totalAmount: true },
        });
    }

    static async agreementStatus(dateFilter: any, filters: Filters) {
        return prisma.agreement.findMany({
            where: {
                ...dateFilter,
                ...(getArrayFilter<Status>(filters, "status") && {
                    status: { in: getArrayFilter<Status>(filters, "status")! }
                }),
                ...(getSingleFilter<string>(filters, "clientId") && {
                    userId: getSingleFilter<string>(filters, "clientId")!
                }),
                ...(getArrayFilter<SpaceType>(filters, "spaceType") && {
                    space: { type: { in: getArrayFilter<SpaceType>(filters, "spaceType")! } }
                }),
            },
            select: {
                id: true,
                status: true,
                monthlyRentAmount: true,
                rentStartDate: true,
                user: { select: { name: true } },
                space: { select: { spaceCode: true, type: true } },
            },
        });
    }

    static async supportTicket(dateFilter: any, filters: Filters) {
        return prisma.support.groupBy({
            by: ["status", "priority", "category"],
            where: {
                ...dateFilter,
                ...(getArrayFilter<SupportStatus>(filters, "status") && {
                    status: { in: getArrayFilter<SupportStatus>(filters, "status")! }
                }),
                ...(getArrayFilter<string>(filters, "priority") && {
                    priority: { in: getArrayFilter<string>(filters, "priority")! }
                }),
                ...(getArrayFilter<string>(filters, "category") && {
                    category: { in: getArrayFilter<string>(filters, "category")! }
                }),
                ...(getSingleFilter<string>(filters, "clientId") && {
                    clientId: getSingleFilter<string>(filters, "clientId")!
                }),
            },
            _count: { id: true },
        });
    }

    static async warehouseCapacity(dateFilter: any, filters: Filters) {
        return prisma.warehouse.findMany({
            select: {
                id: true,
                name: true,
                capacity: true,
                spaces: {
                    select: { size: true, status: true },
                    where: dateFilter,
                },
            },
            where: {
                ...(getSingleFilter<string>(filters, "warehouseId") && {
                    id: getSingleFilter<string>(filters, "warehouseId")!
                }),
            },
        });
    }

    static async clientActivity(dateFilter: any, filters: Filters) {
        return prisma.user.findMany({
            where: {
                ...dateFilter,
                role: "CUSTOMER",
                ...(getSingleFilter<string>(filters, "clientId") && {
                    id: getSingleFilter<string>(filters, "clientId")!
                }),
            },
            select: {
                id: true,
                name: true,
                agreements: { select: { id: true, status: true } },
                invoices: { select: { id: true, status: true } },
                supports: { select: { id: true, status: true } },
            },
        });
    }

    static async invoiceAging(dateFilter: any, filters: Filters) {
        return prisma.invoice.findMany({
            where: {
                ...dateFilter,
                status: { in: ["PENDING", "OVERDUE"] },
                ...(getSingleFilter<string>(filters, "clientId") && {
                    clientId: getSingleFilter<string>(filters, "clientId")!
                }),
            },
            select: {
                id: true,
                invoiceNumber: true,
                dueDate: true,
                totalAmount: true,
                status: true,
                client: { select: { name: true } },
            },
        });
    }

    static async spaceUtilization(dateFilter: any, filters: Filters) {
        const occupiedStatus = 'OCCUPIED';
        const notOccupiedStatuses = ['AVAILABLE', 'MAINTENANCE', 'RESERVED'];

        const whereClause = {
            ...dateFilter,
            ...(getArrayFilter<SpaceType>(filters, 'type') && {
                type: { in: getArrayFilter<SpaceType>(filters, 'type')! },
            }),
            ...(getSingleFilter<string>(filters, 'warehouseId') && {
                warehouseId: getSingleFilter<string>(filters, 'warehouseId')!
            }),
        };

        const [groupedData, occupiedTotal, notOccupiedTotal, warehouseData] = await Promise.all([
            prisma.space.groupBy({
                by: ['type', 'status', 'warehouseId'],
                where: whereClause,
                _sum: { size: true },
                _count: { id: true },
            }),
            prisma.space.aggregate({
                where: {
                    ...whereClause,
                    status: occupiedStatus,
                },
                _sum: { size: true },
                _count: { id: true },
            }),
            prisma.space.aggregate({
                where: {
                    ...whereClause,
                    status: { in: notOccupiedStatuses },
                },
                _sum: { size: true },
                _count: { id: true },
            }),
            prisma.warehouse.findMany({
                where: {
                    ...(getSingleFilter<string>(filters, 'warehouseId') && {
                        id: getSingleFilter<string>(filters, 'warehouseId')!
                    }),
                },
                select: {
                    id: true,
                    name: true,
                    capacity: true,
                    spaces: {
                        select: { size: true, status: true, type: true },
                        where: whereClause,
                    },
                },
            }),
        ]);

        const totalOccupied = occupiedTotal._sum.size ?? 0;
        const totalNotOccupied = notOccupiedTotal._sum.size ?? 0;
        const totalSpace = totalOccupied + totalNotOccupied;
        const utilizationRate = totalSpace > 0 ? (totalOccupied / totalSpace) * 100 : 0;

        const warehouseMetrics = warehouseData.map(warehouse => {
            const warehouseOccupied = warehouse.spaces
                .filter(space => space.status === occupiedStatus)
                .reduce((sum, space) => sum + (space.size || 0), 0);
            const warehouseTotal = warehouse.spaces
                .reduce((sum, space) => sum + (space.size || 0), 0);
            return {
                warehouseId: warehouse.id,
                warehouseName: warehouse.name,
                occupied: warehouseOccupied,
                total: warehouseTotal,
                utilizationRate: warehouseTotal > 0 ? (warehouseOccupied / warehouseTotal) * 100 : 0,
                spaceCount: warehouse.spaces.length,
            };
        });

        return {
            groupedData,
            totals: {
                occupied: totalOccupied,
                notOccupied: totalNotOccupied,
                total: totalSpace,
                utilizationRate: Number(utilizationRate.toFixed(2)),
            },
            warehouseMetrics,
        };
    }
}

const REPORT_HANDLERS = {
    SPACE_OCCUPANCY: ReportHandlers.spaceOccupancy,
    REVENUE: ReportHandlers.revenue,
    AGREEMENT_STATUS: ReportHandlers.agreementStatus,
    SUPPORT_TICKET: ReportHandlers.supportTicket,
    WAREHOUSE_CAPACITY: ReportHandlers.warehouseCapacity,
    CLIENT_ACTIVITY: ReportHandlers.clientActivity,
    INVOICE_AGING: ReportHandlers.invoiceAging,
    SPACE_UTILIZATION: ReportHandlers.spaceUtilization,
} as const;

export async function fetchReportData(formData: FormData) {
    try {
        const input = ReportInputSchema.parse({
            reportType: formData.get("reportType"),
            startDate: formData.get("startDate") || undefined,
            endDate: formData.get("endDate") || undefined,
            filters: formData.get("filters")
                ? JSON.parse(formData.get("filters") as string)
                : {},
        });

        const { reportType, startDate, endDate, filters } = input;

        const dateFilter = buildDateFilter(startDate, endDate);

        // Process filters to handle 'all'
        const processedFilters = Object.fromEntries(
            Object.entries(filters).map(([key, value]) => [
                key,
                value === 'all' ? undefined : value,
            ])
        );

        const handler = REPORT_HANDLERS[reportType];
        if (!handler) {
            throw new Error(`Invalid report type: ${reportType}`);
        }

        return await handler(dateFilter, processedFilters);

    } catch (error) {
        console.error("Error fetching report data:", error);
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${error.errors.map(e => e.message).join(", ")}`);
        }
        throw new Error("Failed to fetch report data");
    }
}