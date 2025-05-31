"use client";

import React, { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { Bar, Pie } from "react-chartjs-2";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SpaceStatus, SpaceType, InvoiceStatus, Status, SupportStatus } from "@prisma/client";
import { fetchReportData } from "@/app/actions/report/report";
import { getAllWarehouses } from "@/app/actions/warehouseActions/warehouseActions";
import { getClients } from "@/app/actions/clientActions/customer";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const FormSchema = z.object({
    reportType: z.string(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    filters: z.record(z.any()).default({}),
});

type FormData = z.infer<typeof FormSchema>;
type DropdownOption = { id: string; name: string };

const FILTER_CONFIG = {
    SPACE_OCCUPANCY: [
        { key: "status", label: "Status", options: Object.values(SpaceStatus), multiple: true },
        { key: "type", label: "Type", options: Object.values(SpaceType), multiple: true },
        { key: "warehouseId", label: "Warehouse", options: [], multiple: false },
    ],
    REVENUE: [
        { key: "status", label: "Status", options: Object.values(InvoiceStatus), multiple: true },
        { key: "clientId", label: "Client", options: [], multiple: false },
        { key: "warehouseId", label: "Warehouse", options: [], multiple: false },
    ],
    AGREEMENT_STATUS: [
        { key: "status", label: "Status", options: Object.values(Status), multiple: true },
        { key: "clientId", label: "Client", options: [], multiple: false },
        { key: "spaceType", label: "Space Type", options: Object.values(SpaceType), multiple: true },
    ],
    SUPPORT_TICKET: [
        { key: "status", label: "Status", options: Object.values(SupportStatus), multiple: true },
        { key: "priority", label: "Priority", options: ["High", "Medium", "Low"], multiple: true },
        { key: "category", label: "Category", options: ["Maintenance", "Billing", "Access"], multiple: true },
        { key: "clientId", label: "Client", options: [], multiple: false },
    ],
    WAREHOUSE_CAPACITY: [
        { key: "warehouseId", label: "Warehouse", options: [], multiple: false },
    ],
    CLIENT_ACTIVITY: [
        { key: "clientId", label: "Client", options: [], multiple: false },
    ],
    INVOICE_AGING: [
        { key: "clientId", label: "Client", options: [], multiple: false },
    ],
    SPACE_UTILIZATION: [
        { key: "type", label: "Type", options: Object.values(SpaceType), multiple: true },
        { key: "warehouseId", label: "Warehouse", options: [], multiple: false },
    ],
} as const;

const ReportPage: React.FC = () => {
    const [reportData, setReportData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState<DropdownOption[]>([]);
    const [clients, setClients] = useState<DropdownOption[]>([]);
    const [selectedMultiValues, setSelectedMultiValues] = useState<Record<string, string[]>>({});
    const [error, setError] = useState<string | null>(null);
    const chartRef = useRef<any>(null); // Use 'any' or ChartJSOrUndefined if available
    const [isChartLoaded, setIsChartLoaded] = useState(true); // Track chart render status

    const { control, handleSubmit, watch, setValue, reset } = useForm<FormData>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            reportType: "SPACE_OCCUPANCY",
            startDate: "",
            endDate: "",
            filters: {},
        },
    });

    const reportType = watch("reportType") as keyof typeof FILTER_CONFIG;

    useEffect(() => {
        const fetchDropdowns = async () => {
            try {
                const [warehouseResult, clientResult] = await Promise.all([
                    getAllWarehouses({ page: 1, limit: 100, search: '' }),
                    getClients(1, 100, Status.ACTIVE, ''),
                ]);

                if (warehouseResult?.success && warehouseResult.data) {
                    setWarehouses(warehouseResult.data.warehouses.map((w: any) => ({
                        id: w.id,
                        name: w.name,
                    })));
                } else {
                    setError("Failed to load warehouses");
                }

                if (clientResult.success) {
                    setClients(
                        (clientResult?.clients ?? []).map((client: any) => ({
                            id: client.id,
                            name: client.name ?? client.companyName ?? client.contactName ?? "Unnamed Client",
                        }))
                    );
                } else {
                    setError("Failed to load clients");
                }
            } catch (err) {
                setError('Failed to load dropdown data');
            }
        };
        fetchDropdowns();
    }, []);

    useEffect(() => {
        setValue("filters", {});
        setSelectedMultiValues({});
    }, [reportType, setValue]);

    const getFilterConfig = () => {
        const config = FILTER_CONFIG[reportType] || [];
        return config.map(filter => ({
            ...filter,
            options: filter.key === "warehouseId" ? warehouses :
                filter.key === "clientId" ? clients :
                    filter.options,
        }));
    };

    const handleMultiSelectChange = (filterKey: string, value: string) => {
        const currentValues = selectedMultiValues[filterKey] || [];
        const newValues = currentValues.includes(value)
            ? currentValues.filter(v => v !== value)
            : [...currentValues, value];

        setSelectedMultiValues(prev => ({ ...prev, [filterKey]: newValues }));
        setValue(`filters.${filterKey}`, newValues);
    };

    const onSubmit = async (data: FormData) => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('reportType', data.reportType);
            if (data.startDate) formData.append('startDate', data.startDate);
            if (data.endDate) formData.append('endDate', data.endDate);

            formData.append('filters', JSON.stringify(data.filters || {}));

            console.log('FormData entries:', Object.fromEntries(formData));
            const result = await fetchReportData(formData);
            console.log('Report data:', result);
            setReportData(result);
             setIsChartLoaded(false);
        } catch (error) {
            console.error('Failed to fetch report:', error);
            setReportData(null);
            setError('Failed to fetch report data');
        } finally {
            setLoading(false);
        }
    };

    const getChartData = () => {
        if (!reportData) return null;

        const colors = {
            primary: "#3b82f6",
            success: "#10b981",
            warning: "#f59e0b",
            danger: "#ef4444",
            info: "#6366f1",
        };
        const statusColors: Record<string, string> = {
            PENDING: colors.warning, // Orange for PENDING
            ACTIVE: colors.success,  // Green for ACTIVE
            TERMINATED: colors.danger, // Red for TERMINATED (if applicable)
            EXPIRED: colors.info,   // Purple for EXPIRED (if applicable)
        };

        switch (reportType) {
            case "SPACE_UTILIZATION":
                const { warehouseMetrics, totals } = reportData;
                return {
                    type: "bar" as const,
                    data: {
                        labels: warehouseMetrics?.map((w: any) => w.warehouseName),
                        datasets: [
                            {
                                label: "Occupied Space",
                                data: warehouseMetrics?.map((w: any) => w.occupied),
                                backgroundColor: colors.success,
                                borderWidth: 1,
                            },
                            {
                                label: "Total Space",
                                data: warehouseMetrics?.map((w: any) => w.total),
                                backgroundColor: colors.primary,
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                title: { display: true, text: "Space (sq ft)" },
                            },
                            x: {
                                title: { display: true, text: "Warehouse" },
                            },
                        },
                      plugins: {
                            title: {
                                display: true,
                                text: `Space Utilization Report (${totals?.utilizationRate}% Utilized)`,
                            },
                            tooltip: {
                                callbacks: {
                                    label: (context: any) => {
                                        const warehouse = warehouseMetrics[context.dataIndex];
                                        return `${context.dataset.label}: ${context.raw} sq ft (${warehouse.utilizationRate.toFixed(2)}% utilized)`;
                                    },
                                },
                            },
                        },
                    },
                };

            case "SPACE_OCCUPANCY":
                return {
                    type: "bar" as const,
                    data: {
                        labels: reportData.map((d: any) => `${d.warehouseName} - ${d.status}`),
                        datasets: [
                            {
                                label: "Space Count",
                                data: reportData.map((d: any) => d.count),
                                backgroundColor: Object.values(colors),
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: "Number of Spaces" } },
                            x: { title: { display: true, text: "Warehouse - Status" } },
                        },
                        plugins: { title: { display: true, text: "Space Occupancy Report" } },
                    },
                };

            case "REVENUE":
                return {
                    type: "bar" as const,
                    data: {
                        labels: reportData.map((d: any) => `${d.clientName} - ${d.status}`),
                        datasets: [
                            {
                                label: "Total Amount",
                                data: reportData.map((d: any) => d.totalAmount),
                                backgroundColor: colors.primary,
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: "Amount ($)" } },
                            x: { title: { display: true, text: "Client - Status" } },
                        },
                        plugins: { title: { display: true, text: "Revenue Report" } },
                    },
                };


            case "AGREEMENT_STATUS":
                const agreementCounts = reportData.reduce((acc: any, agreement: any) => {
                    const key = `${agreement.clientName} - ${agreement.status}`;
                    acc[key] = (acc[key] || 0) + 1;
                    return acc;
                }, {});
                const labels = Object.keys(agreementCounts);
                return {
                    type: "bar" as const,
                    data: {
                        labels,
                        datasets: [
                            {
                                label: "Agreement Count",
                                data: Object.values(agreementCounts),
                                backgroundColor: labels.map(label => {
                                    const status = label.split(' - ')[1]; // Extract status from "Client - Status"
                                    return statusColors[status] || colors.info; // Default to info if status is unknown
                                }),
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: "Number of Agreements" } },
                            x: { title: { display: true, text: "Client - Status" } },
                        },
                        plugins: {
                            title: { display: true, text: "Agreement Status Report" },
                            legend: {
                                display: true,
                                position: 'top' as const,
                            },
                        },
                    },
                };

            case "SUPPORT_TICKET":
                return {
                    type: "pie" as const,
                    data: {
                        labels: reportData.map((d: any) => `${d.status} - ${d.priority}`),
                        datasets: [
                            {
                                label: "Tickets",
                                data: reportData.map((d: any) => d.count),
                                backgroundColor: Object.values(colors),
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { title: { display: true, text: "Support Ticket Report" } },
                    },
                };

            case "WAREHOUSE_CAPACITY":
                const totalAvailable = reportData.reduce((sum: number, w: any) => sum + w.availableSpace, 0);
                const totalNotAvailable = reportData.reduce((sum: number, w: any) => sum + w.notAvailableSpace, 0);
                return {
                    type: "pie" as const,
                    data: {
                        labels: ["Available Space", "Not Available Space"],
                        datasets: [
                            {
                                label: "Space",
                                data: [totalAvailable, totalNotAvailable],
                                backgroundColor: [colors.success, colors.danger],
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: { display: true, text: "Warehouse Capacity Report" },
                            tooltip: {
                                callbacks: {
                                    label: (context: any) => {
                                        const label = context.label || '';
                                        const value = context.raw || 0;
                                        const total = totalAvailable + totalNotAvailable;
                                        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : 0;
                                        return `${label}: ${value} sq ft (${percentage}%)`;
                                    },
                                },
                            },
                        },
                    },
                };

            case "CLIENT_ACTIVITY":
                return {
                    type: "bar" as const,
                    data: {
                        labels: reportData.map((d: any) => d.clientName),
                        datasets: [
                            {
                                label: "Agreements",
                                data: reportData.map((d: any) => d.agreementCount),
                                backgroundColor: colors.primary,
                                borderWidth: 1,
                            },
                            {
                                label: "Invoices",
                                data: reportData.map((d: any) => d.invoiceCount),
                                backgroundColor: colors.warning,
                                borderWidth: 1,
                            },
                            {
                                label: "Support Tickets",
                                data: reportData.map((d: any) => d.supportCount),
                                backgroundColor: colors.danger,
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: "Count" } },
                            x: { title: { display: true, text: "Client" } },
                        },
                        plugins: { title: { display: true, text: "Client Activity Report" } },
                    },
                };

            case "INVOICE_AGING":
                return {
                    type: "bar" as const,
                    data: {
                        labels: reportData.map((d: any) => `${d.clientName} - ${d.status}`),
                        datasets: [
                            {
                                label: "Invoice Amount",
                                data: reportData.map((d: any) => d.totalAmount),
                                backgroundColor: colors.warning,
                                borderWidth: 1,
                            },
                        ],
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: { beginAtZero: true, title: { display: true, text: "Amount ($)" } },
                            x: { title: { display: true, text: "Client - Status" } },
                        },
                        plugins: { title: { display: true, text: "Invoice Aging Report" } },
                    },
                };

            default:
                return null;
        }
    };
    const downloadCSV = () => {
        if (!reportData || (Array.isArray(reportData) && !reportData.length)) return;

        let headers: string[] = [];
        let rows: any[] = [];

        switch (reportType) {
            case "SPACE_UTILIZATION":
                headers = ["Warehouse", "Occupied (sq ft)", "Total (sq ft)", "Utilization Rate", "Space Count"];
                rows = reportData?.warehouseMetrics;
                break;
            case "SPACE_OCCUPANCY":
                headers = ["warehouseName", "status", "count"];
                rows = reportData;
                break;
            case "REVENUE":
                headers = ["clientName", "status", "totalAmount"];
                rows = reportData;
                break;
            case "AGREEMENT_STATUS":
                headers = ["id", "status", "monthlyRentAmount", "rentStartDate", "clientName", "spaceCode", "spaceType", "warehouseName"];
                rows = reportData;
                break;
            case "SUPPORT_TICKET":
                headers = ["Status", "Priority", "Category", "Count"];
                rows = reportData;
                break;
            case "WAREHOUSE_CAPACITY":
                headers = ["warehouseName", "totalCapacity", "availableSpace", "notAvailableSpace", "spaceCount"];
                rows = reportData;
                break;
            case "CLIENT_ACTIVITY":
                headers = ["clientName", "agreementCount", "activeAgreements", "invoiceCount", "pendingInvoices", "supportCount", "openSupports"];
                rows = reportData;
                break;
            case "INVOICE_AGING":
                headers = ["invoiceNumber", "dueDate", "totalAmount", "status", "clientName"];
                rows = reportData;
                break;
            default:
                headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];
                rows = reportData;
        }

        // Format data for CSV
        const csvRows = [];
        // Add headers
        csvRows.push(headers.map(header => `"${header.replace(/"/g, '""')}"`).join(','));

        // Add data rows
        rows.forEach(row => {
            const values = headers.map(header => {
                let value = row[header] ?? "-";
                if (reportType === "SPACE_UTILIZATION" && header === "utilizationRate") {
                    value = `${row.utilizationRate.toFixed(2)}%`;
                } else if (reportType === "SPACE_OCCUPANCY" && header === "spaceCount") {
                    value = row.count;
                } else if (reportType === "REVENUE" && header === "totalAmount") {
                    value = `$${row.totalAmount}`;
                } else if (reportType === "AGREEMENT_STATUS" && header === "monthlyRentAmount") {
                    value = `$${row.monthlyRentAmount}`;
                } else if (reportType === "AGREEMENT_STATUS" && header === "rentStartDate") {
                    value = new Date(row.rentStartDate).toLocaleDateString();
                } else if (reportType === "INVOICE_AGING" && header === "totalAmount") {
                    value = `$${row.totalAmount}`;
                } else if (reportType === "INVOICE_AGING" && header === "dueDate") {
                    value = new Date(row.dueDate).toLocaleDateString();
                }
                return `"${String(value).replace(/"/g, '""')}"`;
            });
            csvRows.push(values.join(','));
        });

        // Create CSV content
        const csvContent = csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType.toLowerCase().replace(/_/g, '-')}-report-${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const downloadChart = () => {
        if (!chartRef.current) return;

        const canvas = chartRef.current.canvas;
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `${reportType.toLowerCase().replace(/_/g, '-')}-chart-${new Date().toISOString().split('T')[0]}.png`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const renderChart = () => {
        if (!reportData) {
            return <div className="text-center py-8 text-gray-500">No data available</div>;
        }

        const chartConfig = getChartData();
        if (!chartConfig) {
            return null;
        }

        const ChartComponent = chartConfig.type === "pie" ? Pie : Bar;

        return (
            <div className="h-96">
                <ChartComponent
                    ref={(ref: any) => {
                        chartRef.current = ref;
                        if (ref) {
                            console.log('Chart rendered, ref set:', ref);

                        }
                    }}
                    data={chartConfig.data} options={chartConfig.options} />
            </div>
        );
    };

    const renderTable = () => {
        if (!reportData || (Array.isArray(reportData) && !reportData.length)) return null;

        let headers: string[] = [];
        let rows: any[] = [];
        console.log(reportData)
        console.log(reportType)

        switch (reportType) {
            case "SPACE_UTILIZATION":
                headers = ["Warehouse", "Occupied (sq ft)", "Total (sq ft)", "Utilization Rate", "Space Count"];
                rows = reportData?.warehouseMetrics;
                break;
            case "SPACE_OCCUPANCY":
                headers = ["warehouseName", "status", "count"];
                rows = reportData;
                break;
            case "REVENUE":
                headers = ["clientName", "status", "totalAmount"];
                rows = reportData;
                break;
            case "AGREEMENT_STATUS":
                headers = ["id", "status", "monthlyRentAmount", "rentStartDate", "clientName", "spaceCode", "spaceType", "warehouseName"];
                rows = reportData;
                break;
            case "SUPPORT_TICKET":
                headers = ["Status", "Priority", "Category", "Count"];
                rows = reportData;
                break;
            case "WAREHOUSE_CAPACITY":
                headers = ["warehouseName", "totalCapacity", "availableSpace", "notAvailableSpace", "spaceCount"];
                rows = reportData;
                break;
            case "CLIENT_ACTIVITY":
                headers = ["clientName", "agreementCount", "activeAgreements", "invoiceCount", "pendingInvoices", "supportCount", "openSupports"];
                rows = reportData;
                break;
            case "INVOICE_AGING":
                headers = ["invoiceNumber", "dueDate", "totalAmount", "status", "clientName"];
                rows = reportData;
                break;
            default:
                headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];
                rows = reportData;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-blue-500">
                        <tr>
                            {headers.map(header => (
                                <th
                                    key={header}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-100 uppercase tracking-wider"
                                >
                                    {header.replace(/([A-Z])/g, " $1").replace(/^./, str => str.toUpperCase())}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {rows.map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                                {headers.map(header => (
                                    <td key={header} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {reportType === "SPACE_UTILIZATION" && header === "utilizationRate"
                                            ? `${row.utilizationRate.toFixed(2)}%`
                                            : reportType === "SPACE_OCCUPANCY" && header === "spaceCount"
                                                ? row.count
                                                : reportType === "REVENUE" && header === "totalAmount"
                                                    ? `₹${row.totalAmount}`
                                                    : reportType === "AGREEMENT_STATUS" && header === "monthlyRentAmount"
                                                        ? `₹${row.monthlyRentAmount}`
                                                        : reportType === "AGREEMENT_STATUS" && header === "rentStartDate"
                                                            ? new Date(row.rentStartDate).toLocaleDateString()
                                                            : reportType === "INVOICE_AGING" && header === "totalAmount"
                                                                ? `₹${row.totalAmount}`
                                                                : reportType === "INVOICE_AGING" && header === "dueDate"
                                                                    ? new Date(row.dueDate).toLocaleDateString()
                                                                    : row[header] ?? "-"
                                        }
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Warehouse Reports</CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <div className="text-red-500 mb-4">{error}</div>}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label>Report Type</Label>
                            <Controller
                                name="reportType"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field?.value} onValueChange={field.onChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select report type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.keys(FILTER_CONFIG).map(type => (
                                                <SelectItem key={type} value={type}>
                                                    {type.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Start Date</Label>
                                <Controller
                                    name="startDate"
                                    control={control}
                                    render={({ field }) => <Input type="date" {...field} />}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>End Date</Label>
                                <Controller
                                    name="endDate"
                                    control={control}
                                    render={({ field }) => <Input type="date" {...field} />}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label>Filters</Label>
                            {getFilterConfig().map(filter => (
                                <div key={filter.key} className="space-y-2">
                                    <Label>{filter.label}</Label>
                                    {filter.multiple ? (
                                        <div className="space-y-2">
                                            <Select onValueChange={(value) => handleMultiSelectChange(filter.key, value)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={`Add ${filter.label.toLowerCase()}`} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filter.options.map(option => {
                                                        const value = typeof option === "string" ? option : option.id;
                                                        const label = typeof option === "string" ? option : option.name;
                                                        return (
                                                            <SelectItem key={value} value={value}>
                                                                {label}
                                                            </SelectItem>
                                                        );
                                                    })}
                                                </SelectContent>
                                            </Select>
                                            <div className="flex flex-wrap gap-2">
                                                {(selectedMultiValues[filter.key] || []).map(value => (
                                                    <Badge
                                                        key={value}
                                                        variant="secondary"
                                                        className="cursor-pointer"
                                                        onClick={() => handleMultiSelectChange(filter.key, value)}
                                                    >
                                                        {value} ×
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <Controller
                                            name={`filters.${filter.key}`}
                                            control={control}
                                            render={({ field }) => (
                                                <Select value={field.value || ""} onValueChange={field.onChange}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select ${filter.label.toLowerCase()}`} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="all">All</SelectItem>
                                                        {filter.options.map(option => {
                                                            const value = typeof option === "string" ? option : option.id;
                                                            const label = typeof option === "string" ? option : option.name;
                                                            return (
                                                                <SelectItem key={value} value={value}>
                                                                    {label}
                                                                </SelectItem>
                                                            );
                                                        })}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Generating..." : "Generate Report"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Report Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end space-x-4 mb-4">
                        {reportData && (
                            <>
                                <Button onClick={downloadCSV} disabled={!reportData}>
                                    Download Table as CSV
                                </Button>
                                {getChartData() && (
                                    <Button onClick={downloadChart} disabled={!chartRef?.current}>
                                        Download Chart as PNG
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                    {renderChart()}
                    {renderTable()}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportPage;