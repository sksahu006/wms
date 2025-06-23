'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUsers } from "@/app/actions/clientActions/customer";
import { createInvoice } from "@/app/actions/invoiceActions/invoice";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { getSpacesByAgreement } from "@/app/actions/aggrementActions/aggrements";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { handleFileUpload } from "@/lib/handleFileUpload";

const formSchema = z.object({
    invoiceNumber: z
        .string()
        .min(1, "Invoice number is required"),
    clientId: z.string().cuid("Please select a valid client"),
    spaceId: z.string().cuid("Please select a valid space"),
    date: z
        .string()
        .refine(value => !isNaN(Date.parse(value)), "Invalid date format")
        .transform(value => new Date(value).toISOString()), // Convert to proper ISO string
    amount: z.number().positive("Amount must be positive"),
    tax: z.number().nonnegative("Tax must be non-negative"),
    totalAmount: z.number().positive("Total amount must be positive"),
    dueDate: z
        .string()
        .refine(value => !isNaN(Date.parse(value)), "Invalid due date format")
        .transform(value => new Date(value).toISOString()), // Convert to proper ISO string
});

export default function AddInvoiceForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    interface Client {
        id: string;
        name: string;
        agreements: { id: string; name: string }[];
    }

    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [availableSpaces, setAvailableSpaces] = useState<{ name: string | null; id: string; spaceCode: string; agreementId: string }[]>([])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000).toString(),
            clientId: "",
            spaceId: "",
            date: new Date()?.toISOString()?.slice(0, 16),  // Format the date correctly here
            amount: 0,
            tax: 0,
            totalAmount: 0,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
        },
    });

    interface UserOption {
        id: string;
        label: string;
        agreements: {
            spaceId: string;
            status: "PENDING" | "ACTIVE" | "INACTIVE";
            id: string;
            createdAt: Date;
            userId: string;
            invoiceId: string | null;
            clientName: string | null;
            contactPerson: string;
            remarks: string | null;
        }[];
    }

    const [userOptions, setUserOptions] = useState<UserOption[]>([]);
    const [allUserData, setAllUserData] = useState<UserOption[]>([]);
    const [agreementId, setAgreementId] = useState<string>("");


    // Fetch users for the combobox
    const fetchUsers = async (search: string) => {
        const usersResult = await getUsers({ page: 1, pageSize: 15, search });

        console.log(usersResult)
        if (usersResult.success) {
            const mapped = usersResult.data.map((user) => ({
                id: user.id,
                label: user.name || user.id,
                agreements: (user.agreements || []).map((agreement: any) => ({
                    spaceId: agreement.spaceId,
                    status: agreement.status,
                    id: agreement.id,
                    createdAt: agreement.createdAt,
                    userId: agreement.userId,
                    invoiceId: agreement.invoiceId ?? null,
                    clientName: agreement.clientName ?? null,
                    contactPerson: agreement.contactPerson,
                    remarks: agreement.remarks ?? null,
                })),
            }));
            setUserOptions(mapped);
            return mapped;
        }
        return [];
    };


    const fetchSpaces = async () => {
        if (selectedClient) {

            const spacesResult = await getSpacesByAgreement(selectedClient.id);
            if (spacesResult.success && spacesResult.data) {
                setAvailableSpaces(spacesResult?.data);
            }
        }
    };

    // Whenever the selectedClient changes, fetch the spaces for that client
    useEffect(() => {
        if (selectedClient) {
            fetchSpaces();
        } else {
            setAvailableSpaces([]); // Clear spaces if no client is selected
        }
    }, [selectedClient]);

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const formElement = document.querySelector("form");
            const fileInput = formElement?.querySelector<HTMLInputElement>('input[name="document"]');
            const file = fileInput?.files?.[0];

            let uploadedUrl = "";

            if (file) {
                uploadedUrl = await handleFileUpload(file) || "";
            }
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

            formData.append("agreementId", agreementId);
            if (uploadedUrl) {
                formData.append("documentUrl", uploadedUrl ?? "");
            }
            const result = await createInvoice(formData);
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Invoice created successfully",
                });
                router.push("/dashboard/invoices");
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to create invoice",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "An unexpected error occurred",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    const formatDate = (date: string) => {
        const parsedDate = new Date(date);
        return parsedDate.toISOString().slice(0, 16);  // Strip milliseconds and timezone
    };


    const handleGetAgreementId = async (spaceId: string) => {
        const selectedSpace = availableSpaces.find(space => space.id === spaceId);
        setAgreementId(selectedSpace?.agreementId || "");

    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
                <FormField
                    control={form.control}
                    name="invoiceNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                                <Input placeholder="INV-1234" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Client</FormLabel>
                            <FormControl>
                                <SearchableCombobox
                                    value={field.value}
                                    // onValueChange={field.onChange}
                                    onValueChange={(value) => {
                                        field.onChange(value);
                                        const selected = userOptions.find((user: any) => user.id === value);
                                        if (selected) {
                                            setSelectedClient({
                                                id: selected.id,
                                                name: selected.label,
                                                agreements: selected.agreements.map(agreement => ({
                                                    id: agreement.id,
                                                    name: agreement.clientName || agreement.id,
                                                })),
                                            });
                                        } else {
                                            setSelectedClient(null); // Reset to null if no client is selected
                                        }
                                    }}
                                    // setSelectedClient(selected);
                                    placeholder="Select a client"
                                    searchPlaceholder="Search clients..."
                                    fetchData={fetchUsers}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {selectedClient && (
                    <FormField
                        control={form.control}
                        name="spaceId"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Space</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value)
                                            handleGetAgreementId(value)
                                        }}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a space" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableSpaces.map((space) => (
                                                <SelectItem key={space.id} value={space.id}>
                                                    {space.name} ({space.spaceCode})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                )}


                {/* Date & Due Date side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...field}
                                        value={field.value ? formatDate(field.value) : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Due Date</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        {...field}
                                        value={field.value ? formatDate(field.value) : ''}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>



                {/* Amount & Tax side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"

                                        placeholder="1000.00"
                                        min={0}
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="tax"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tax</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"

                                        placeholder="100.00"
                                        {...field}
                                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Total amount full width */}
                <FormField
                    control={form.control}
                    name="totalAmount"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Total Amount</FormLabel>
                            <FormControl>
                                <Input
                                    type="number"

                                    placeholder="1100.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="space-y-2">
                    <FormLabel>Upload Invoice Document</FormLabel>
                    <Input
                        type="file"
                        accept="application/pdf,image/*"
                        name="document"
                    />
                </div>


                {/* Buttons */}
                {/* <div className="flex gap-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Invoice"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/invoices")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div> */}

                <div className="flex gap-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className={`border-none text-white flex items-center ${isSubmitting
                            ? 'bg-gradient-to-r from-gray-500 to-gray-600 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                            }`}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Invoice"
                        )}
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/dashboard/invoices")}
                        disabled={isSubmitting}
                        className={`border-none text-white ${isSubmitting
                            ? 'bg-gradient-to-r from-gray-300 to-gray-400 opacity-50 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700'
                            }`}
                    >
                        Cancel
                    </Button>
                </div>

            </form>
        </Form >
    );
}

