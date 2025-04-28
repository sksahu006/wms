'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Building2,
    Calendar,
    Edit,
    FileText,
    MapPin,
    Package,
    Ruler,
    Snowflake,
} from 'lucide-react';
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUsers } from "@/app/actions/clientActions/customer";
import { allocateSpace } from "@/app/actions/spaceActions/spaceActions";
import { SearchableCombobox } from "@/components/ui/SearchableCombobox";

const fetchUsers = async (search: string) => {
    const usersResult = await getUsers({ page: 1, pageSize: 10, search });
    console.log("Fetched users:", usersResult);
    if (usersResult.success) {
        return usersResult.data.map((user: any) => ({
            id: user.id,
            label: user.name || user.id,
        }));
    }
    return [];
};

export default function WarehouseSpaceDetailsClient({ space }: { space: any }) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isAllocateDialogOpen, setIsAllocateDialogOpen] = useState(false);
    const [clientId, setClientId] = useState<string>("");

    const handleAllocate = async (formData: FormData) => {
        setIsLoading(true);
        formData.append("spaceId", space.id);
        const result = await allocateSpace(formData);
        setIsLoading(false);

        if (result.success) {
            setIsAllocateDialogOpen(false);
            toast({
                title: "Space Allocated",
                description: result.message,
            });
            router.push("/dashboard/warehouse");
        } else {
            console.log(result.error)
            toast({
                title: "Error",
                description: result.error,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" asChild>
                    <Link href="/dashboard/warehouse">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back</span>
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Space Details</h1>
                <div className="ml-auto space-x-2">
                    <Button variant="outline" asChild>
                        <Link href={`/dashboard/warehouse/${space.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Space
                        </Link>
                    </Button>

                    {space.status === "AVAILABLE" && (
                        <Dialog open={isAllocateDialogOpen} onOpenChange={setIsAllocateDialogOpen}>
                            <DialogTrigger asChild>
                                <Button>Allocate Space</Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Allocate Warehouse Space</DialogTitle>
                                    <DialogDescription>
                                        Assign this space to a client and set lease terms.
                                    </DialogDescription>
                                </DialogHeader>
                                <form action={handleAllocate} className="py-4 space-y-4">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="clientId">Select Client</Label>
                                        <>
                                            <SearchableCombobox
                                                value={clientId}
                                                onValueChange={setClientId}
                                                placeholder="Select a client"
                                                searchPlaceholder="Search clients..."
                                                fetchData={fetchUsers}
                                            />
                                            <input type="hidden" name="clientId" value={clientId} />
                                        </>

                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="rate">Monthly Rate ($)</Label>
                                        <Input
                                            type="number"
                                            id="rate"
                                            name="rate"
                                            defaultValue={space.rate || 1200}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Notes</Label>
                                        <Textarea id="notes" name="notes" placeholder="Additional notes about this allocation" />
                                    </div>

                                    <DialogFooter>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAllocateDialogOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button type="submit" disabled={isLoading}>
                                            {isLoading ? "Allocating..." : "Allocate Space"}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="md:col-span-3">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Space Information</CardTitle>
                            <Badge className={space.status === "OCCUPIED" ? "bg-green-500" : "border-blue-500 text-blue-500"}>
                                {space.status}
                            </Badge>
                        </div>
                        <CardDescription>ID: {space.id}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between items-center gap-4 p-4 border rounded-lg">
                            <div className="space-y-2 max-w-[60%]">
                                <div className="flex items-center text-sm">
                                    <Building2 className="mr-2 h-4 w-4" />
                                    <span className="font-medium">{space.name}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    {space.type === "COLD" ? (
                                        <Snowflake className="mr-2 h-4 w-4 text-blue-500" />
                                    ) : (
                                        <Package className="mr-2 h-4 w-4" />
                                    )}
                                    <span>{space.type}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Ruler className="mr-2 h-4 w-4" />
                                    <span>{space.size} sqft (Height: {space.height} ft)</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{space.location}</span>
                                </div>
                                <div className="flex items-center text-sm">
                                    <Calendar className="mr-2 h-4 w-4" />
                                    <span>Rate: ${space.rate}/month</span>
                                </div>
                            </div>
                            {space.images && space.images.length > 0 && (
                                <Image
                                    src={space?.images?.[0]}
                                    alt={space.name}
                                    width={200}
                                    height={200}
                                    className="rounded-md object-cover"
                                />
                            )}
                        </div>

                        {space.client && (
                            <div>
                                <h3 className="text-sm font-medium mb-2">Current Tenant</h3>
                                <div className="space-y-1 text-sm">
                                    <p>
                                        <span className="font-medium">{space.client.name}</span> ({space.client.id})
                                    </p>
                                    <p>Expires: TBD</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs">Utilization:</span>
                                        <Progress value={0} className="h-2 w-[100px]" />
                                        <span className="text-xs">0%</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div>
                            <h3 className="text-sm font-medium mb-2">Description</h3>
                            <p className="text-sm">{space.description}</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium mb-2">Features</h3>
                            <div className="flex flex-wrap gap-2">
                                {space.features.map((feature: string, i: number) => (
                                    <Badge key={i} variant="outline">{feature}</Badge>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="md:col-span-4">
                    <CardHeader>
                        <CardTitle>Space Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="history" className="space-y-4">
                            <TabsList className="grid grid-cols-3 w-full">
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="documents">Documents</TabsTrigger>
                                <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
                            </TabsList>

                            <TabsContent value="history">
                                <p>No activity history available.</p>
                            </TabsContent>

                            <TabsContent value="documents">
                                <div className="text-center py-8">
                                    <FileText className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No Documents</h3>
                                    <p className="text-sm text-muted-foreground">There are no documents associated with this space.</p>
                                    <Button className="mt-4">Upload Document</Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="maintenance">
                                <div className="text-center py-8">
                                    <Building2 className="mx-auto h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium">No Maintenance Records</h3>
                                    <p className="text-sm text-muted-foreground">No maintenance activity found.</p>
                                    <Button className="mt-4">Schedule Maintenance</Button>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                    <CardFooter className="justify-between">
                        <Button variant="outline" asChild>
                            <Link href="/dashboard/warehouse">Back to List</Link>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}