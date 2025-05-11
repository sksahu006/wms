import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  FileText,
  Package,
  Users,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { notificationPage?: string };
}) {
  const notificationPage = parseInt(searchParams.notificationPage || "1");
  const response = await fetch(
    `${process.env.NEXTAUTH_URL}/api/dashboard?support=${notificationPage}`,
    { cache: "no-store" }
  );
  const result = await response.json();

  if (!result.success || !result.data) {
    return <div>Error: {result.error || "Failed to load dashboard data"}</div>;
  }

  const { overview, revenueChart, analytics, recentActivities, notifications } = result.data;

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-sky-950">
          <TabsTrigger className="text-white" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="text-white" value="analytics">Analytics</TabsTrigger>
          <TabsTrigger className="text-white" value="reports">Reports</TabsTrigger>
          <TabsTrigger className="text-white" value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <span>₹</span>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{overview.totalRevenue.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">
                  {overview.totalRevenue.change >= 0 ? "+" : ""}
                  {overview.totalRevenue.change.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Warehouse Utilization</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.warehouseUtilization.percentage.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  {overview.warehouseUtilization.change >= 0 ? "+" : ""}
                  {overview.warehouseUtilization.change.toFixed(1)}% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.activeClients.count}</div>
                <p className="text-xs text-muted-foreground">+{overview.activeClients.newThisMonth} new this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overview.pendingInvoices.count}</div>
                <p className="text-xs text-muted-foreground">
                  ₹{overview.pendingInvoices.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} outstanding
                </p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <DashboardCharts chartType="revenue" data={revenueChart} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
                <CardDescription>Latest system activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity: any) => (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className={`rounded-full p-1 bg-${activity.iconColor}-100`}>
                        {activity.icon === "AlertTriangle" && <AlertTriangle className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                        {activity.icon === "CheckCircle2" && <CheckCircle2 className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                        {activity.icon === "Clock" && <Clock className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                        {activity.icon === "Package" && <Package className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                        {activity.icon === "Building2" && <Building2 className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                        {activity.icon === "Wrench" && <Wrench className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                      </div>
                      <div className="space-y-1">
                        <Link href={activity.link} className="text-sm font-medium leading-none hover:underline">
                          {activity.message}
                        </Link>
                        <p className="text-xs text-muted-foreground">
                          {new Date(activity.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Revenue trend over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardCharts chartType="monthlyRevenue" data={analytics.monthlyRevenue} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Warehouse Utilization</CardTitle>
                <CardDescription>Current utilization across warehouses</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardCharts chartType="warehouseUtilization" data={analytics.warehouseUtilization} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Client Distribution</CardTitle>
              <CardDescription>Distribution of client types</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-[300px]">
                <DashboardCharts chartType="clientDistribution" data={analytics.clientDistribution} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reports</CardTitle>
              <CardDescription>Generate and download reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted" />
                <h3 className="mt-4 text-lg font-medium">Reports Dashboard</h3>
                <p className="mt-2 text-sm text-muted-foreground">Report generation tools will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>View all system notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notifications.items.map((notification: any) => (
                  <div key={notification.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-full p-1 bg-${notification.iconColor}-100`}>
                        {notification.icon === "AlertTriangle" && <AlertTriangle className={`h-4 w-4 text-${notification.iconColor}-600`} />}
                        {notification.icon === "CheckCircle2" && <CheckCircle2 className={`h-4 w-4 text-${notification.iconColor}-600`} />}
                        {notification.icon === "Clock" && <Clock className={`h-4 w-4 text-${notification.iconColor}-600`} />}
                      </div>
                      <div className="space-y-1">
                        <Link href={notification.link} className="text-sm font-medium leading-none hover:underline">
                          {notification.message}
                        </Link>
                        <div className="text-xs text-muted-foreground">
                          {notification.details} - {new Date(notification.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
                        </div>
                      </div>
                    </div>
                    {notification.actions.includes("resolve") && (
                      <form
                        action={async () => {
                          "use server";
                          await prisma.support.update({
                            where: { id: notification.id },
                            data: { status: "RESOLVED" },
                          });
                        }}
                      >
                        <Button variant="outline" size="sm">
                          Mark as Resolved
                        </Button>
                      </form>
                    )}
                  </div>
                ))}
                {notifications.hasMore && (
                  <div className="mt-4 text-center">
                    <Link href={`/dashboard?notificationPage=${notificationPage + 1}`}>
                      <Button variant="outline">Load More</Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}