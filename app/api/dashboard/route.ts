import { NextResponse } from "next/server";
import { startOfDay, subDays, subMonths, format, addMonths } from "date-fns";
import { prisma } from "@/lib/prisma";


export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const notificationPage = parseInt(searchParams.get("notificationPage") || "1");
        const notificationLimit = 10;

        const now = new Date();
        const startOfThisMonth = startOfDay(subDays(now, now.getDate() - 1));
        const startOfLastMonth = subMonths(startOfThisMonth, 1);
        const sevenDaysAgo = subDays(now, 7);
        const thirtyDaysFromNow = addMonths(now, 1);

        // Overview Stats
        const [
            totalRevenueThisMonth,
            totalRevenueLastMonth,
            spaceStats,
            spaceStatsLastMonth,
            activeClients,
            newClientsThisMonth,
            pendingInvoices,
            recentActivities,
            notifications,
            allRevenue
        ] = await Promise.all([
            // Total Revenue (PAID invoices this month)
            prisma.invoice.aggregate({
                where: { status: "PAID",isDeleted:false, date: { gte: startOfThisMonth } },
                _sum: { totalAmount: true },
            }),
            // Total Revenue (PAID invoices last month)
            prisma.invoice.aggregate({
                where: { status: "PAID",isDeleted:false, date: { gte: startOfLastMonth, lt: startOfThisMonth } },
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
                where: { status: { in: ["PENDING", "OVERDUE"] },isDeleted:false },
                _sum: { totalAmount: true },
                _count: { id: true },
            }),
            // Recent Activities (combined from Support, Invoice, Agreement, Space)
            Promise.all([
                // Support Tickets (OPEN or IN_PROGRESS, last 5 days)
                prisma.support.findMany({
                    where: { status: { in: ["OPEN", "IN_PROGRESS"] }, createdAt: { gte: subDays(now, 5) } },
                    select: { id: true, subject: true, category: true, priority: true, status: true, createdAt: true },
                    take: 5,
                }),
                // Invoices (PAID or OVERDUE, last 5 days)
                prisma.invoice.findMany({
                    where: { status: { in: ["PAID", "OVERDUE"] }, updatedAt: { gte: subDays(now, 5) },isDeleted:false },
                    select: { id: true, invoiceNumber: true, totalAmount: true, status: true, dueDate: true, updatedAt: true },
                    take: 5,
                }),
                // Agreements (Expiring soon or PENDING, last 5 days)
                prisma.agreement.findMany({
                    where: {
                        isDeleted: false,
                        OR: [
                            { status: "PENDING", createdAt: { gte: subDays(now, 5) } },
                            {
                                agreementPeriod: { not: null },
                                rentStartDate: {
                                    lte: addMonths(thirtyDaysFromNow, -1),
                                    gte: subMonths(now, 12), // Within a reasonable range
                                },
                            },
                        ],
                    },
                    select: { id: true, spaceId: true, status: true, rentStartDate: true, agreementPeriod: true, createdAt: true },
                    take: 5,
                }),
                // Spaces (OCCUPIED or MAINTENANCE, last 5 days)
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
                            message: isExpiring
                                ? `Agreement for Space ${a.spaceId} expires soon`
                                : `New agreement for Space ${a.spaceId}`,
                            details: isExpiring
                                ? `Expires: ${format(addMonths(a.rentStartDate!, a.agreementPeriod!), "MMM d, yyyy")}`
                                : `Status: ${a.status}`,
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
                return activities
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .slice(0, 5);
            }),
            // Notifications (Support-focused, paginated)
            prisma.support.findMany({
                where: { status: { in: ["OPEN", "IN_PROGRESS", "RESOLVED"] } },
                select: {
                    id: true,
                    subject: true,
                    category: true,
                    priority: true,
                    status: true,
                    createdAt: true,
                    message: true,
                },
                orderBy: { createdAt: "desc" },
                skip: (notificationPage - 1) * notificationLimit,
                take: notificationLimit,
            }).then(notifications => notifications.map(n => ({
                type: "support",
                id: n.id,
                message: n.subject,
                details: `Category: ${n.category}, Priority: ${n.priority}`,
                status: n.status,
                createdAt: n.createdAt,
                icon: n.status === "OPEN" ? "AlertTriangle" : n.status === "IN_PROGRESS" ? "Clock" : "CheckCircle2",
                iconColor: n.status === "OPEN" ? "red" : n.status === "IN_PROGRESS" ? "yellow" : "green",
                link: `/dashboard/support/${n.id}`,
                actions: n.status !== "RESOLVED" ? ["view", "resolve"] : ["view"],
            }))),
             // Total Revenue (PAID invoices last month)
            prisma.invoice.aggregate({
                where: { status: "PAID",isDeleted:false },
                _sum: { totalAmount: true },
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

        // Revenue Overview (last 7 days)
        const revenueByDay = await prisma.invoice.groupBy({
            by: ["date"],
            where: { status: "PAID",isDeleted:false, date: { gte: sevenDaysAgo } },
            _sum: { totalAmount: true },
            orderBy: { date: "asc" },
        });

        const revenueChartData = Array.from({ length: 7 }, (_, i) => {
            const date = subDays(now, 6 - i);
            const dayData = revenueByDay.find(d => format(d.date, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
            return { date: format(date, "MMM d"), revenue: dayData?._sum.totalAmount || 0 };
        });

        // Analytics: Monthly Revenue (last 6 months)
        const sixMonthsAgo = subMonths(now, 6);
        const monthlyRevenue = await prisma.invoice.groupBy({
            by: ["date"],
            where: { status: "PAID",isDeleted:false, date: { gte: sixMonthsAgo } },
            _sum: { totalAmount: true },
        });

        const monthlyRevenueData = Array.from({ length: 6 }, (_, i) => {
            const monthStart = subMonths(startOfThisMonth, 5 - i);
            const monthData = monthlyRevenue.filter(d => format(d.date, "yyyy-MM") === format(monthStart, "yyyy-MM"));
            const total = monthData.reduce((sum, d) => sum + (d._sum.totalAmount || 0), 0);
            return { month: format(monthStart, "MMM"), revenue: total };
        });

        // Analytics: Warehouse Utilization (per warehouse)
        const warehouseUtilization = await prisma.warehouse.findMany({
            where: { isDeleted: false },
            include: { spaces: { select: { status: true } } },
        });

        const utilizationByWarehouse = warehouseUtilization.map(w => {
            const total = w.spaces.length;
            const occupied = w.spaces.filter(s => s.status === "OCCUPIED").length;
            return { name: w.name, utilization: total > 0 ? (occupied / total) * 100 : 0 };
        });

        // Analytics: Client Distribution
        const clientDistribution = await prisma.user.groupBy({
            by: ["businessType"],
            where: { role: "CUSTOMER", status: "ACTIVE" },
            _count: { id: true },
        });

        const clientDistributionData = clientDistribution.map(c => ({
            type: c.businessType || "Unknown",
            count: c._count.id,
        }));

        return NextResponse.json({
            success: true,
            data: {
                overview: {
                    allRevenue: { amount: allRevenue._sum.totalAmount || 0 },
                    totalRevenue: { amount: revenueThisMonth, change: revenueChange },
                    warehouseUtilization: { percentage: utilization, change: utilizationChange },
                    activeClients: { count: activeClients, newThisMonth: newClientsThisMonth },
                    pendingInvoices: { count: pendingInvoiceCount, amount: pendingInvoiceAmount },
                },
                revenueChart: revenueChartData,
                analytics: {
                    monthlyRevenue: monthlyRevenueData,
                    warehouseUtilization: utilizationByWarehouse,
                    clientDistribution: clientDistributionData,
                },
                recentActivities,
                notifications: {
                    items: notifications,
                    page: notificationPage,
                    hasMore: notifications.length === notificationLimit,
                },
            },
        });
    } catch (error) {
        console.error("Dashboard API error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Failed to fetch dashboard data" },
            { status: 500 }
        );
    }
}