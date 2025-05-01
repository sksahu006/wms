'use client';

import { useState } from "react";
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
import { getSpaces, getUsers } from "@/app/actions/clientActions/customer";
import { createInvoice } from "@/app/actions/invoiceActions/invoice";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";
import { formatToUTCISOString } from "@/lib/formatToUTCISOString";

// Zod schema for form validation
const formSchema = z.object({
    invoiceNumber: z
        .string()
        .min(1, "Invoice number is required")
        .regex(/^INV-\d+$/, "Invoice number must start with 'INV-' followed by digits"),
    clientId: z.string().cuid("Please select a valid client"),
    spaceId: z.string().cuid("Please select a valid space"),
    date: z.string().datetime({ message: "Invalid date format" }),
    amount: z.number().positive("Amount must be positive"),
    tax: z.number().nonnegative("Tax must be non-negative"),
    totalAmount: z.number().positive("Total amount must be positive"),
    dueDate: z.string().datetime({ message: "Invalid due date format" }),
}).refine(
    (data) => Math.abs(data.totalAmount - (data.amount + data.tax)) < 0.01,
    {
        message: "Total amount must equal amount + tax",
        path: ["totalAmount"],
    }
);

export default function AddInvoiceForm() {
    const router = useRouter();
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000).toString(),
            clientId: "",
            spaceId: "",
            date: formatToUTCISOString(new Date()),
            amount: 0,
            tax: 0,
            totalAmount: 0,
            dueDate: formatToUTCISOString(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)),
        },
    });

    const fetchUsers = async (search: string) => {
        const usersResult = await getUsers({ page: 1, pageSize: 10, search });
        if (usersResult.success) {
            return usersResult.data.map((user) => ({
                id: user.id,
                label: user.name || user.id,
            }));
        }
        return [];
    };

    const fetchSpaces = async (search: string) => {
        const spacesResult = await getSpaces({ page: 1, pageSize: 10, search });
        if (spacesResult.success) {
            return spacesResult.data.map((space) => ({
                id: space.id,
                label: space.spaceCode || space.name || space.id,
            }));
        }
        return [];
    };

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsSubmitting(true);
        try {
            const formData = new FormData();
            Object.entries(values).forEach(([key, value]) => {
                formData.append(key, value.toString());
            });

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
                                    onValueChange={field.onChange}
                                    placeholder="Select a client"
                                    searchPlaceholder="Search clients..."
                                    fetchData={fetchUsers}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="spaceId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Space</FormLabel>
                            <FormControl>
                                <SearchableCombobox
                                    value={field.value}
                                    onValueChange={field.onChange}
                                    placeholder="Select a space"
                                    searchPlaceholder="Search spaces..."
                                    fetchData={fetchSpaces}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Date & Due Date side by side */}
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Date</FormLabel>
                                <FormControl>
                                    <Input type="datetime-local" {...field} value={field.value.split('.')[0]} />
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
                                    <Input type="datetime-local" {...field} value={field.value.split('.')[0]} />
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
                                        step="0.01"
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
                                        step="0.01"
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
                                    step="0.01"
                                    placeholder="1100.00"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Buttons */}
                <div className="flex gap-4">
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
                </div>

            </form>
        </Form>
    );
}
