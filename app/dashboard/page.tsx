// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import {
//   AlertTriangle,
//   Building2,
//   CheckCircle2,
//   Clock,
//   FileText,
//   Package,
//   Users,
//   Wrench,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import Link from "next/link";
// import { prisma } from "@/lib/prisma";
// import DashboardCharts from "@/components/DashboardCharts";

// export default async function DashboardPage({
//   searchParams,
// }: {
//   searchParams: { notificationPage?: string };
// }) {
//   const notificationPage = parseInt(searchParams.notificationPage || "1");
//   const response = await fetch(
//     `${process.env.NEXTAUTH_URL}/api/dashboard?support=${notificationPage}`,
//     { cache: "no-store" }
//   );
//   const result = await response.json();

//   if (!result.success || !result.data) {
//     return <div>Error: {result.error || "Failed to load dashboard data"}</div>;
//   }

//   const { overview, revenueChart, analytics, recentActivities, notifications } = result.data;

//   return (
//     <div className="flex flex-col gap-4">
//       <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
//       <Tabs defaultValue="overview" className="space-y-4">
//         <TabsList className="bg-blue-900">
//           <TabsTrigger className="text-white" value="overview">Overview</TabsTrigger>
//           <TabsTrigger className="text-white" value="analytics">Analytics</TabsTrigger>
//           <TabsTrigger className="text-white" value="reports">Reports</TabsTrigger>
//           <TabsTrigger className="text-white" value="notifications">Notifications</TabsTrigger>
//         </TabsList>
//         <TabsContent value="overview" className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
//                 <span>₹</span>
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">
//                   ₹{overview.totalRevenue.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   {overview.totalRevenue.change >= 0 ? "+" : ""}
//                   {overview.totalRevenue.change.toFixed(1)}% from last month
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Warehouse Utilization</CardTitle>
//                 <Building2 className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{overview.warehouseUtilization.percentage.toFixed(1)}%</div>
//                 <p className="text-xs text-muted-foreground">
//                   {overview.warehouseUtilization.change >= 0 ? "+" : ""}
//                   {overview.warehouseUtilization.change.toFixed(1)}% from last month
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{overview.activeClients.count}</div>
//                 <p className="text-xs text-muted-foreground">+{overview.activeClients.newThisMonth} new this month</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
//                 <FileText className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{overview.pendingInvoices.count}</div>
//                 <p className="text-xs text-muted-foreground">
//                   ₹{overview.pendingInvoices.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} outstanding
//                 </p>
//               </CardContent>
//             </Card>
//           </div>
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
//             <Card className="col-span-4">
//               <CardHeader>
//                 <CardTitle>Revenue Overview</CardTitle>
//               </CardHeader>
//               <CardContent className="pl-2">
//                 <DashboardCharts chartType="revenue" data={revenueChart} />
//               </CardContent>
//             </Card>
//             <Card className="col-span-3">
//               <CardHeader>
//                 <CardTitle>Recent Activities</CardTitle>
//                 <CardDescription>Latest system activities</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <div className="space-y-4">
//                   {recentActivities.map((activity: any) => (
//                     <div key={activity.id} className="flex items-center gap-4">
//                       <div className={`rounded-full p-1 bg-${activity.iconColor}-100`}>
//                         {activity.icon === "AlertTriangle" && <AlertTriangle className={`h-4 w-4 text-${activity.iconColor}-600`} />}
//                         {activity.icon === "CheckCircle2" && <CheckCircle2 className={`h-4 w-4 text-${activity.iconColor}-600`} />}
//                         {activity.icon === "Clock" && <Clock className={`h-4 w-4 text-${activity.iconColor}-600`} />}
//                         {activity.icon === "Package" && <Package className={`h-4 w-4 text-${activity.iconColor}-600`} />}
//                         {activity.icon === "Building2" && <Building2 className={`h-4 w-4 text-${activity.iconColor}-600`} />}
//                         {activity.icon === "Wrench" && <Wrench className={`h-4 w-4 text-${activity.iconColor}-600`} />}
//                       </div>
//                       <div className="space-y-1">
//                         <Link href={activity.link} className="text-sm font-medium leading-none hover:underline">
//                           {activity.message}
//                         </Link>
//                         <p className="text-xs text-muted-foreground">
//                           {new Date(activity.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
//                         </p>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>
//         <TabsContent value="analytics" className="space-y-4">
//           <div className="grid gap-4 md:grid-cols-2">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Monthly Revenue</CardTitle>
//                 <CardDescription>Revenue trend over the last 6 months</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <DashboardCharts chartType="monthlyRevenue" data={analytics.monthlyRevenue} />
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle>Warehouse Utilization</CardTitle>
//                 <CardDescription>Current utilization across warehouses</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <DashboardCharts chartType="warehouseUtilization" data={analytics.warehouseUtilization} />
//               </CardContent>
//             </Card>
//           </div>
//           <Card>
//             <CardHeader>
//               <CardTitle>Client Distribution</CardTitle>
//               <CardDescription>Distribution of client types</CardDescription>
//             </CardHeader>
//             <CardContent className="flex justify-center">
//               <div className="w-[300px]">
//                 <DashboardCharts chartType="clientDistribution" data={analytics.clientDistribution} />
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="reports" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Reports</CardTitle>
//               <CardDescription>Generate and download reports</CardDescription>
//             </CardHeader>
//             <CardContent className="h-[400px] flex items-center justify-center">
//               <div className="text-center">
//                 <FileText className="mx-auto h-12 w-12 text-muted" />
//                 <h3 className="mt-4 text-lg font-medium">Reports Dashboard</h3>
//                 <p className="mt-2 text-sm text-muted-foreground">Report generation tools will be displayed here</p>
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//         <TabsContent value="notifications" className="space-y-4">
//           <Card>
//             <CardHeader>
//               <CardTitle>Notifications</CardTitle>
//               <CardDescription>View all system notifications</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 {notifications.items.map((notification: any) => (
//                   <div key={notification.id} className="flex items-center justify-between gap-4">
//                     <div className="flex items-center gap-4">
//                       <div className={`rounded-full p-1 bg-${notification.iconColor}-100`}>
//                         {notification.icon === "AlertTriangle" && <AlertTriangle className={`h-4 w-4 text-${notification.iconColor}-600`} />}
//                         {notification.icon === "CheckCircle2" && <CheckCircle2 className={`h-4 w-4 text-${notification.iconColor}-600`} />}
//                         {notification.icon === "Clock" && <Clock className={`h-4 w-4 text-${notification.iconColor}-600`} />}
//                       </div>
//                       <div className="space-y-1">
//                         <Link href={notification.link} className="text-sm font-medium leading-none hover:underline">
//                           {notification.message}
//                         </Link>
//                         <div className="text-xs text-muted-foreground">
//                           {notification.details} - {new Date(notification.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
//                         </div>
//                       </div>
//                     </div>
//                     {notification.actions.includes("resolve") && (
//                       <form
//                         action={async () => {
//                           "use server";
//                           await prisma.support.update({
//                             where: { id: notification.id },
//                             data: { status: "RESOLVED" },
//                           });
//                         }}
//                       >
//                         <Button variant="outline" size="sm">
//                           Mark as Resolved
//                         </Button>
//                       </form>
//                     )}
//                   </div>
//                 ))}
//                 {notifications.hasMore && (
//                   <div className="mt-4 text-center">
//                     <Link href={`/dashboard?notificationPage=${notificationPage + 1}`}>
//                       <Button variant="outline">Load More</Button>
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             </CardContent>
//           </Card>
//         </TabsContent>
//       </Tabs>
//     </div>
//   );
// }
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
  ArrowRight,
  BarChart,
  Bell,
  PieChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import DashboardCharts from "@/components/DashboardCharts";
import { Badge } from "@/components/ui/badge";

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
    <div className="flex flex-col gap-6 px-4 md:px-6 py-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold  dark:text-gray-100">Dashboard Overview</h1>
        <Badge variant="outline" className="bg-green-100 text-green-800">
          <CheckCircle2 className="h-4 w-4 mr-2 ml-3" />
          Operational
        </Badge>
      </div>

      <Tabs defaultValue="overview">
        {/* <TabsList className="bg-blue-900"> */}
        <TabsList className="">
          <TabsTrigger className="text-white" value="overview">Overview</TabsTrigger>
          <TabsTrigger className="text-white" value="analytics">Analytics</TabsTrigger>
          <TabsTrigger className="text-white" value="reports">Reports</TabsTrigger>
          <TabsTrigger className="text-white" value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-medium ">Total Revenue</CardTitle>
                  <div className="text-2xl font-bold  mt-2">
                    ₹{overview.totalRevenue.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <span className="text-blue-600 font-bold">₹</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-sm ${overview.totalRevenue.change >= 0 ? 'text-green-900' : 'text-red-600'}`}>
                  {overview.totalRevenue.change >= 0 ? '↑' : '↓'} {Math.abs(overview.totalRevenue.change).toFixed(1)}%
                  <span className="text-gray-900 ml-2">vs last month</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-medium ">Warehouse Utilization</CardTitle>
                  <div className="text-2xl font-bold  mt-2">
                    {overview.warehouseUtilization.percentage.toFixed(1)}%
                  </div>
                </div>
                <div className="bg-purple-100 p-3 rounded-full">
                  <Building2 className="h-5 w-5 text-purple-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-purple-600 rounded-full transition-all duration-500"
                    style={{ width: `${overview.warehouseUtilization.percentage}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-medium ">Active Clients</CardTitle>
                  <div className="text-2xl font-bold  mt-2">
                    {overview.activeClients.count}
                  </div>
                </div>
                <div className="bg-green-100 p-3 rounded-full">
                  <Users className="h-5 w-5 text-green-800" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-green-900">
                  +{overview.activeClients.newThisMonth} new this month
                </div>
              </CardContent>
            </Card>

            {/* <Card className="border border-black bg-gradient-to-br from-blue-900 to-white"> */}
            <Card className="border border-black bg-blue-900 text-white dark:bg-gradient-to-br dark:from-blue-900 dark:to-blue-300">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-sm font-medium ">Pending Invoices</CardTitle>
                  <div className="text-2xl font-bold  mt-2">
                    {overview.pendingInvoices.count}
                  </div>
                </div>
                <div className="bg-orange-100 p-3 rounded-full">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm ">
                  ₹{overview.pendingInvoices.amount.toLocaleString("en-IN", { minimumFractionDigits: 2 })} outstanding
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 mt-6 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4 p-6 border border-gray-200 text-white bg-blue-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold ">Revenue Overview</CardTitle>
                <CardDescription className="text-gray-300 text-sm">Last 12 months performance</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-80 bg-gray-200 bg-gradient-to-br from-blue-200 to-white">
                <DashboardCharts chartType="revenue" data={revenueChart} />
              </CardContent>
            </Card>

            <Card className="col-span-3 p-6 border border-black bg-blue-900 ">
              <CardHeader className="p-0 mb-4 bg-blue-200 rounded-md m-3 p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-semibold  text-gray-800">Recent Activities</CardTitle>
                    <CardDescription className="text-gray-500">Latest system events</CardDescription>
                  </div>
                  {/* <Button variant="default" size="sm" className="bg-blue-600 text-white hover:bg-blue-700">
                    View All
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button> */}

                </div>
              </CardHeader>
              <CardContent className="p-0 space-y-6 ml-3 mr-3 ">
                {recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-start group">
                    <div className={`p-2 rounded-lg mr-4 bg-${activity.iconColor}-100`}>
                      {activity.icon === "AlertTriangle" && <AlertTriangle className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                      {activity.icon === "CheckCircle2" && <CheckCircle2 className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                      {activity.icon === "Clock" && <Clock className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                      {activity.icon === "Package" && <Package className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                      {activity.icon === "Building2" && <Building2 className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                      {activity.icon === "Wrench" && <Wrench className={`h-4 w-4 text-${activity.iconColor}-600`} />}
                    </div>
                    <div className="flex-1">
                      <Link href={activity.link} className="text-sm  text-white font-medium hover:text-red-600 transition-colors">
                        {activity.message}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.createdAt).toLocaleDateString("en-IN", {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6 border border-gray-200 text-white bg-blue-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold">Monthly Revenue</CardTitle>
                <CardDescription className="text-gray-200 text-sm">Last 6 months trend</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-64 bg-gray-50 bg-repeat-round border border-black">
                <DashboardCharts chartType="monthlyRevenue" data={analytics.monthlyRevenue} />
              </CardContent>
            </Card>

            <Card className="p-6 border border-gray-200 text-white bg-blue-900">
              <CardHeader className="p-0 mb-4">
                <CardTitle className="text-lg font-semibold">Warehouse Utilization</CardTitle>
                <CardDescription className="text-gray-200 text-sm">Current distribution</CardDescription>
              </CardHeader>
              <CardContent className="p-0 h-64 bg-gray-50 bg-repeat-round border border-black">
                <DashboardCharts chartType="warehouseUtilization" data={analytics.warehouseUtilization} />
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 p-6 border border-gray-200 text-white bg-blue-900">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-semibold">Client Distribution</CardTitle>
              <CardDescription className="text-gray-200 text-sm">Customer type segmentation</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="w-full h-auto max-w-md bg-gray-50 bg-repeat-round border border-black">
                <DashboardCharts chartType="clientDistribution" data={analytics.clientDistribution} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="p-6 border border-gray-200">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg font-semibold">Reports Dashboard</CardTitle>
              <CardDescription className="text-gray-500">Generate and manage business reports</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex flex-col items-center justify-center space-y-4 bg-gray-50 bg-repeat-round border border-black">
              <FileText className="h-16 w-16 text-blue-600" />
              <h3 className="text-xl font-semibold">Custom Report Generation</h3>
              <p className="text-gray-500 text-center max-w-md">
                Generate detailed financial, operational, and client reports with custom date ranges and filters.
              </p>
              <Button className="mt-4">
                Generate New Report
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card className="border border-gray-300 shadow-xl">
            <CardHeader className="p-6 border-b border-b-gray-400">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold">System Notifications</CardTitle>
                  <CardDescription className="text-gray-700 text-xs">Recent alerts and messages</CardDescription>
                </div>
                <Badge variant="outline" className="bg-orange-400 border-orange-400">
                  {notifications.items.length} New
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {notifications.items.map((notification: any) => (
                <div key={notification.id} className="p-4 rounded-lg text-black bg-gray-100 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start">
                      <div className={`p-2 rounded-lg mr-4 bg-${notification.iconColor}-100`}>
                        {notification.icon === "AlertTriangle" && <AlertTriangle className={`h-5 w-5 text-${notification.iconColor}-600`} />}
                        {notification.icon === "CheckCircle2" && <CheckCircle2 className={`h-5 w-5 text-${notification.iconColor}-600`} />}

                      </div>
                      <div>
                        <Link href={notification.link} className="text-sm font-medium hover:text-blue-600">
                          {notification.message}
                        </Link>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(notification.createdAt).toLocaleDateString("en-IN", {
                            dateStyle: "long"
                          })}
                        </div>
                      </div>
                    </div>
                    {notification.actions.includes("resolve") && (
                      <form action={async () => {
                        "use server";
                        await prisma.support.update({
                          where: { id: notification.id },
                          data: { status: "RESOLVED" },
                        });
                      }}>
                        <Button variant="outline" size="sm" className="border-gray-300">
                          Mark Resolved
                        </Button>
                      </form>
                    )}
                  </div>
                </div>
              ))}
              {notifications.hasMore && (
                <div className="mt-6 text-center">
                  <Link href={`/dashboard?notificationPage=${notificationPage + 1}`}>
                    <Button variant="outline" className="border-gray-300">
                      Load More Notifications
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}