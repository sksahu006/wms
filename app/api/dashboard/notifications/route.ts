import { NextResponse } from "next/server";
import { startOfDay, subDays, subMonths, format } from "date-fns";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const now = new Date();
        const startOfThisMonth = startOfDay(subDays(now, now.getDate() - 1));
        const sixMonthsAgo = subMonths(now, 6);

        const [monthlyRevenue, warehouseUtilization, clientDistribution] = await Promise.all([
            // Monthly Revenue (last 6 months)
            prisma.invoice.groupBy({
                by: ["date"],
                where: { status: "PAID", date: { gte: sixMonthsAgo } },
                _sum: { totalAmount: true },
            }),
            // Warehouse Utilization (per warehouse)
            prisma.warehouse.findMany({
                include: { spaces: { select: { status: true } } },
            }),
            // Client Distribution
            prisma.user.groupBy({
                by: ["businessType"],
                where: { role: "CUSTOMER", status: "ACTIVE" },
                _count: { id: true },
            }),
        ]);

        // Monthly Revenue Data
        const monthlyRevenueData = Array.from({ length: 6 }, (_, i) => {
            const monthStart = subMonths(startOfThisMonth, 5 - i);
            const monthData = monthlyRevenue.filter(d => format(d.date, "yyyy-MM") === format(monthStart, "yyyy-MM"));
            const total = monthData.reduce((sum, d) => sum + (d._sum.totalAmount || 0), 0);
            return { month: format(monthStart, "MMM"), revenue: total };
        });

        // Warehouse Utilization Data
        const utilizationByWarehouse = warehouseUtilization.map(w => {
            const total = w.spaces.length;
            const occupied = w.spaces.filter(s => s.status === "OCCUPIED").length;
            return { name: w.name, utilization: total > 0 ? (occupied / total) * 100 : 0 };
        });

        // Client Distribution Data
        const clientDistributionData = clientDistribution.map(c => ({
            type: c.businessType || "Unknown",
            count: c._count.id,
        }));

        return NextResponse.json({
            success: true,
            data: {
                monthlyRevenue: monthlyRevenueData,
                warehouseUtilization: utilizationByWarehouse,
                clientDistribution: clientDistributionData,
            },
        });
    } catch (error) {
        console.error("Analytics   Analytics API error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch analytics data" },
            { status: 500 }
        );
    }
}