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
   try {
        // Parse input dates
        const start = new Date(startDate);
        const end = new Date(endDate);

        // Validate dates
        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            throw new Error("Invalid date format for startDate or endDate");
        }

        // Ensure startDate is at the beginning of the day (00:00:00.000Z)
        start.setUTCHours(0, 0, 0, 0);
        const startISOString = start.toISOString();

        // Ensure endDate is at the end of the day (23:59:59.999Z)
        end.setUTCHours(23, 59, 59, 999);
        const endISOString = end.toISOString();

        return {
            createdAt: {
                gte: startISOString,
                lte: endISOString,
            },
        };
    } catch (error) {
        console.error("Error parsing dates in buildDateFilter:", error);
        return {};
    }

  
}

// Utility function to safely get array filters
function getArrayFilter<T>(filters: Filters, key: string): T[] | undefined {
    const value = filters[key];
    if (value === 'all' || (Array.isArray(value) && value.includes('all'))) {
        return undefined;
    }
    return Array.isArray(value) ? value : undefined;
}

// Utility function to safely get single filter value
function getSingleFilter<T>(filters: Filters, key: string): T | undefined {
    const value = filters[key];
    if (value === 'all') {
        return undefined;
    }
    return value;
}

// Report handlers
class ReportHandlers {
    static async spaceOccupancy(dateFilter: any, filters: Filters) {
        const spaces = await prisma.space.findMany({
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
            select: {
                status: true,
                warehouse: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Group data manually to include warehouse name
        const groupedData = spaces.reduce((acc, space) => {
            const key = `${space.status}_${space.warehouse.name}`;
            if (!acc[key]) {
                acc[key] = {
                    status: space.status,
                    warehouseName: space.warehouse.name,
                    count: 0,
                };
            }
            acc[key].count += 1;
            return acc;
        }, {} as Record<string, { status: SpaceStatus; warehouseName: string; count: number }>);

        return Object.values(groupedData);
    }

    static async revenue(dateFilter: any, filters: Filters) {
        const invoices = await prisma.invoice.findMany({
            where: {
                isDeleted: false,
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
            select: {
                status: true,
                totalAmount: true,
                client: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        // Group data manually to include client name
        const groupedData = invoices.reduce((acc, invoice) => {
            const key = `${invoice.status}_${invoice.client.name}`;
            if (!acc[key]) {
                acc[key] = {
                    status: invoice.status,
                    clientName: invoice.client.name ?? "",
                    totalAmount: 0,
                };
            }
            acc[key].totalAmount += invoice.totalAmount || 0;
            return acc;
        }, {} as Record<string, { status: InvoiceStatus; clientName: string; totalAmount: number }>);

        return Object.values(groupedData);
    }

    static async agreementStatus(dateFilter: any, filters: Filters) {
        return prisma.agreement.findMany({
            where: {
                isDeleted: false,
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
                space: {
                    select: {
                        spaceCode: true,
                        type: true,
                        warehouse: { select: { name: true } },
                    },
                },
            },
        }).then(agreements => agreements.map(agreement => ({
            id: agreement.id,
            status: agreement.status,
            monthlyRentAmount: agreement.monthlyRentAmount,
            rentStartDate: agreement.rentStartDate,
            clientName: agreement.user.name,
            spaceCode: agreement.space.spaceCode,
            spaceType: agreement.space.type,
            warehouseName: agreement.space.warehouse.name,
        })));
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
        }).then(tickets => tickets.map(ticket => ({
            status: ticket.status,
            priority: ticket.priority,
            category: ticket.category,
            count: ticket._count.id,
        })));
    }

    static async warehouseCapacity(dateFilter: any, filters: Filters) {
        const warehouses = await prisma.warehouse.findMany({
            select: {
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

        return warehouses.map(warehouse => {
            const availableSpace = warehouse.spaces
                .filter(space => space.status === 'AVAILABLE')
                .reduce((sum, space) => sum + (space.size || 0), 0);
            const totalSpace = warehouse.spaces
                .reduce((sum, space) => sum + (space.size || 0), 0);
            return {
                warehouseName: warehouse.name,
                totalCapacity: warehouse.capacity,
                availableSpace,
                notAvailableSpace: totalSpace - availableSpace,
                spaceCount: warehouse.spaces.length,
            };
        });
    }

    static async clientActivity(dateFilter: any, filters: Filters) {
        const clients = await prisma.user.findMany({
            where: {
                ...dateFilter,
                role: "CUSTOMER",
                ...(getSingleFilter<string>(filters, "clientId") && {
                    id: getSingleFilter<string>(filters, "clientId")!
                }),
            },
            select: {
                name: true,
                agreements: { select: { status: true } },
                invoices: { select: { status: true } },
                supports: { select: { status: true } },
            },
        });

        return clients.map(client => ({
            clientName: client.name,
            agreementCount: client.agreements.length,
            activeAgreements: client.agreements.filter(a => a.status === 'ACTIVE').length,
            invoiceCount: client.invoices.length,
            pendingInvoices: client.invoices.filter(i => i.status === 'PENDING').length,
            supportCount: client.supports.length,
            openSupports: client.supports.filter(s => s.status === 'OPEN').length,
        }));
    }

    static async invoiceAging(dateFilter: any, filters: Filters) {
        return prisma.invoice.findMany({
            where: {
                isDeleted: false,
                ...dateFilter,
                status: { in: ["PENDING", "OVERDUE"] },
                ...(getSingleFilter<string>(filters, "clientId") && {
                    clientId: getSingleFilter<string>(filters, "clientId")!
                }),
            },
            select: {
                invoiceNumber: true,
                dueDate: true,
                totalAmount: true,
                status: true,
                client: { select: { name: true } },
            },
        }).then(invoices => invoices.map(invoice => ({
            invoiceNumber: invoice.invoiceNumber,
            dueDate: invoice.dueDate,
            totalAmount: invoice.totalAmount,
            status: invoice.status,
            clientName: invoice.client.name,
        })));
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
            prisma.space.findMany({
                where: whereClause,
                select: {
                    type: true,
                    status: true,
                    size: true,
                    warehouse: {
                        select: {
                            name: true,
                        },
                    },
                },
            }).then(spaces => {
                return Object.values(
                    spaces.reduce((acc, space) => {
                        const key = `${space.type}_${space.status}_${space.warehouse.name}`;
                        if (!acc[key]) {
                            acc[key] = {
                                type: space.type,
                                status: space.status,
                                warehouseName: space.warehouse.name,
                                totalSize: 0,
                                count: 0,
                            };
                        }
                        acc[key].totalSize += space.size || 0;
                        acc[key].count += 1;
                        return acc;
                    }, {} as Record<string, { type: SpaceType; status: SpaceStatus; warehouseName: string; totalSize: number; count: number }>)
                );
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