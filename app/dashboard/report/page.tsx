"use client";

import React, { useState, useEffect } from "react";
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
                    setWarehouses(warehouseResult.data.warehouses);
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

        switch (reportType) {
            case "SPACE_UTILIZATION":
                const { groupedData, totals, warehouseMetrics } = reportData;
                return {
                    type: "bar" as const,
                    data: {
                        labels: warehouseMetrics?.map((w: any) => w?.warehouseName),
                        datasets: [
                            {
                                label: "Occupied Space",
                                data: warehouseMetrics?.map((w: any) => w.occupied),
                                backgroundColor: colors.success,
                                borderWidth: 1,
                            },
                            {
                                label: "Total Space",
                                data: warehouseMetrics.map((w: any) => w.total),
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
                                text: `Space Utilization Report (${totals.utilizationRate}% Utilized)`,
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
                        labels: reportData.map((d: any) => d.status),
                        datasets: [
                            {
                                label: "Space Count",
                                data: reportData.map((d: any) => d._count?.id || 0),
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
                            x: { title: { display: true, text: "Status" } },
                        },
                        plugins: { title: { display: true, text: "Space Occupancy Report" } },
                    },
                };

            case "REVENUE":
                return {
                    type: "bar" as const,
                    data: {
                        labels: reportData.map((d: any) => d.status || "Unknown"),
                        datasets: [
                            {
                                label: "Total Amount",
                                data: reportData.map((d: any) => d._sum?.totalAmount || 0),
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
                            x: { title: { display: true, text: "Status" } },
                        },
                        plugins: { title: { display: true, text: "Revenue Report" } },
                    },
                };

            case "SUPPORT_TICKET":
                return {
                    type: "pie" as const,
                    data: {
                        labels: reportData.map((d: any) => d.status),
                        datasets: [
                            {
                                label: "Tickets",
                                data: reportData.map((d: any) => d._count?.id || 0),
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

            default:
                return null;
        }
    };

    const renderChart = () => {
        if (!reportData) {
            return <div className="text-center py-8 text-gray-500">No data available</div>;
        }

        const chartConfig = getChartData();
        if (!chartConfig) {
            return null;
        }

        if (chartConfig.type === "bar") {
            return (
                <div style={{ height: 400 }}>
                    <Bar data={chartConfig.data} options={chartConfig.options} />
                </div>
            );
        } else if (chartConfig.type === "pie") {
            return (
                <div style={{ height: 400 }}>
                    <Pie data={chartConfig.data} options={chartConfig.options} />
                </div>
            );
        } else {
            return null;
        }
    };

    const renderTable = () => {
        if (!reportData || (Array.isArray(reportData) && !reportData.length)) return null;

        let headers: string[] = [];
        let rows: any[] = [];

        if (reportType === "SPACE_UTILIZATION") {
            headers = ["Warehouse", "Occupied (sq ft)", "Total (sq ft)", "Utilization Rate", "Space Count"];
            rows = reportData.warehouseMetrics;
        } else if (Array.isArray(reportData)) {
            headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];
            rows = reportData;
        } else {
            return <div className="text-center py-8 text-gray-500">Invalid data format</div>;
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 shadow-lg">
                    <thead className="bg-gray-50">
                        <tr className="bg-blue-600 text-white">
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
                                        {reportType === "SPACE_UTILIZATION" && header === "warehouseName"
                                            ? row.warehouseName
                                            : reportType === "SPACE_UTILIZATION" && header === "utilizationRate"
                                            ? `${row.utilizationRate.toFixed(2)}%`
                                            : typeof row[header] === "object"
                                            ? JSON.stringify(row[header])
                                            : String(row[header] || "-")
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
            <Card className="shadow-lg">
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
                    {renderChart()}
                    {renderTable()}
                </CardContent>
            </Card>
        </div>
    );
};

export default ReportPage;