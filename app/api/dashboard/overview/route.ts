import { NextResponse } from "next/server";
import { startOfDay, subDays, subMonths, format, addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";


export async function GET() {
    try {
        const now = new Date();
        const startOfThisMonth = startOfDay(subDays(now, now.getDate() - 1));
        const startOfLastMonth = subMonths(startOfThisMonth, 1);
        const sevenDaysAgo = subDays(now, 7);
        const thirtyDaysFromNow = addMonths(now, 1);

        const [
            totalRevenueThisMonth,
            totalRevenueLastMonth,
            spaceStats,
            spaceStatsLastMonth,
            activeClients,
            newClientsThisMonth,
            pendingInvoices,
            revenueByDay,
            recentActivities,
        ] = await Promise.all([
            // Total Revenue (PAID invoices this month)
            prisma.invoice.aggregate({
                where: { status: "PAID", date: { gte: startOfThisMonth } },
                _sum: { totalAmount: true },
            }),
            // Total Revenue (PAID invoices last month)
            prisma.invoice.aggregate({
                where: { status: "PAID", date: { gte: startOfLastMonth, lt: startOfThisMonth } },
                _sum: { totalAmount: true },
            }),
            // Space Stats (current)
            prisma.space.groupBy({
                by: ["status"],
                _count: { id: true },
            }),
            // Space Stats (last month)
            prisma.space.findMany({
                where: { updatedAt: { lt: startOfThisMonth } },
                select: { status: true },
            }),
            // Active Clients
            prisma.user.count({
                where: { role: "CUSTOMER", status: "ACTIVE" },
            }),
            // New Clients This Month
            prisma.user.count({
                where: { role: "CUSTOMER", status: "ACTIVE", created: { gte: startOfThisMonth } },
            }),
            // Pending Invoices
            prisma.invoice.aggregate({
                where: { status: { in: ["PENDING", "OVERDUE"] } },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
            // Revenue Overview (last 7 days)
            prisma.invoice.groupBy({
                by: ["date"],
                where: { status: "PAID", date: { gte: sevenDaysAgo } },
                _sum: { totalAmount: true },
                orderBy: { date: "asc" },
            }),
            // Recent Activities
            Promise.all([
                prisma.support.findMany({
                    where: { status: { in: ["OPEN", "IN_PROGRESS"] }, createdAt: { gte: subDays(now, 5) } },
                    select: { id: true, subject: true, category: true, priority: true, status: true, createdAt: true },
                    take: 5,
                }),
                prisma.invoice.findMany({
                    where: { status: { in: ["PAID", "OVERDUE"] }, updatedAt: { gte: subDays(now, 5) } },
                    select: { id: true, invoiceNumber: true, totalAmount: true, status: true, dueDate: true, updatedAt: true },
                    take: 5,
                }),
                prisma.agreement.findMany({
                    where: {
                        OR: [
                            { status: "PENDING", createdAt: { gte: subDays(now, 5) } },
                            {
                                agreementPeriod: { not: null },
                                rentStartDate: { lte: addMonths(thirtyDaysFromNow, -1), gte: subMonths(now, 12) },
                            },
                        ],
                    },
                    select: { id: true, spaceId: true, status: true, rentStartDate: true, agreementPeriod: true, createdAt: true },
                    take: 5,
                }),
                prisma.space.findMany({
                    where: { status: { in: ["OCCUPIED", "MAINTENANCE"] }, updatedAt: { gte: subDays(now, 5) } },
                    select: { id: true, spaceCode: true, status: true, updatedAt: true },
                    take: 5,
                }),
            ]).then(([support, invoices, agreements, spaces]) => {
                const activities = [
                    ...support.map(s => ({
                        type: "support",
                        id: s.id,
                        message: `Support ticket: '${s.subject}' ${s.status.toLowerCase()}`,
                        details: `Category: ${s.category}, Priority: ${s.priority}`,
                        status: s.status,
                        createdAt: s.createdAt,
                        icon: s.status === "OPEN" ? "AlertTriangle" : "Clock",
                        iconColor: s.status === "OPEN" ? "red" : "yellow",
                        link: `/dashboard/support/${s.id}`,
                    })),
                    ...invoices.map(i => ({
                        type: "invoice",
                        id: i.id,
                        message: `Invoice #${i.invoiceNumber} ${i.status.toLowerCase()}`,
                        details: `₹${i.totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}${i.status === "OVERDUE" ? `, Due: ${format(i.dueDate, "MMM d, yyyy")}` : ""
                            }`,
                        status: i.status,
                        createdAt: i.updatedAt,
                        icon: i.status === "PAID" ? "CheckCircle2" : "AlertTriangle",
                        iconColor: i.status === "PAID" ? "green" : "red",
                        link: `/dashboard/invoices/${i.id}`,
                    })),
                    ...agreements.map(a => {
                        const isExpiring = a.rentStartDate && a.agreementPeriod && addMonths(a.rentStartDate, a.agreementPeriod) <= thirtyDaysFromNow;
                        return {
                            type: "agreement",
                            id: a.id,
                            message: isExpiring ? `Agreement for Space ${a.spaceId} expires soon` : `New agreement for Space ${a.spaceId}`,
                            details: isExpiring ? `Expires: ${format(addMonths(a.rentStartDate!, a.agreementPeriod!), "MMM d, yyyy")}` : `Status: ${a.status}`,
                            status: a.status,
                            createdAt: isExpiring ? now : a.createdAt,
                            icon: isExpiring ? "Clock" : "Package",
                            iconColor: isExpiring ? "yellow" : "blue",
                            link: `/dashboard/agreements/${a.id}`,
                        };
                    }),
                    ...spaces.map(s => ({
                        type: "space",
                        id: s.id,
                        message: `Space ${s.spaceCode} ${s.status.toLowerCase()}`,
                        details: `Status: ${s.status}`,
                        status: s.status,
                        createdAt: s.updatedAt,
                        icon: s.status === "OCCUPIED" ? "Building2" : "Wrench",
                        iconColor: s.status === "OCCUPIED" ? "blue" : "red",
                        link: `/dashboard/spaces/${s.id}`,
                    })),
                ];
                return activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
            }),
        ]);

        // Calculate Total Revenue
        const revenueThisMonth = totalRevenueThisMonth._sum.totalAmount || 0;
        const revenueLastMonth = totalRevenueLastMonth._sum.totalAmount || 0;
        const revenueChange = revenueLastMonth > 0 ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100 : 0;

        // Calculate Warehouse Utilization
        const totalSpaces = spaceStats.reduce((sum, s) => sum + s._count.id, 0);
        const occupiedSpaces = spaceStats.find(s => s.status === "OCCUPIED")?._count.id || 0;
        const utilization = totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0;

        const lastMonthSpaces = spaceStatsLastMonth.length;
        const lastMonthOccupied = spaceStatsLastMonth.filter(s => s.status === "OCCUPIED").length;
        const lastMonthUtilization = lastMonthSpaces > 0 ? (lastMonthOccupied / lastMonthSpaces) * 100 : 0;
        const utilizationChange = utilization - lastMonthUtilization;

        // Pending Invoices
        const pendingInvoiceCount = pendingInvoices._count.id || 0;
        const pendingInvoiceAmount = pendingInvoices._sum.totalAmount || 0;

        // Revenue Chart
        const revenueChartData = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(now, 6 - i);
            const dayData = revenueByDay.find(d => format(d.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
            return { date: format(date, "MMM d"), revenue: dayData?._sum.totalAmount || 0 };
        });

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    totalRevenue: { amount: revenueThisMonth, change: revenueChange },
                    warehouseUtilization: { percentage: utilization, change: utilizationChange },
                    activeClients: { count: activeClients, newThisMonth: newClientsThisMonth },
                    pendingInvoices: { count: pendingInvoiceCount, amount: pendingInvoiceAmount },
                },
                revenueChart: revenueChartData,
                recentActivities,
            },
        });
    } catch (error) {
        console.error("Overview API error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch overview data" },
            { status: 500 }
        );
    }
}