'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowRight, Loader2 } from 'lucide-react';
import { handleRequestSpace } from '@/app/actions/spaceRequestActions/spaceRequestActions';

export function RequestSpaceForm({
    spaceId,
    spaceName,
    spaceType,
    spaceSize,
    spaceRate,
}: {
    spaceId: string;
    spaceName: string;
    spaceType: string;
    spaceSize: string;
    spaceRate: string;
}) {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    async function onSubmit(formData: FormData) {
        setMessage(null);
        setError(null);
        setIsSubmitting(true);

        const result = await handleRequestSpace(formData);

        setIsSubmitting(false);

        if (result.success) {
            setMessage(result.message ?? null);
            setOpen(false);
            router.refresh();
        } else {
            setError(result.error?.toString() ?? null);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full">
                    Request Space
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Request Space: {spaceName}</DialogTitle>
                </DialogHeader>
                <form action={onSubmit} className="space-y-4">
                    <input type="hidden" name="spaceId" value={spaceId} />
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium">
                            Full Name *
                        </label>
                        <Input id="name" name="name" required />
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium">
                            Email *
                        </label>
                        <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium">
                            Phone
                        </label>
                        <Input id="phone" name="phone" type="tel" />
                    </div>
                    <div>
                        <label htmlFor="companyName" className="block text-sm font-medium">
                            Company Name
                        </label>
                        <Input id="companyName" name="companyName" />
                    </div>
                    <div>
                        <label htmlFor="requirements" className="block text-sm font-medium">
                            Requirements
                        </label>
                        <Textarea id="requirements" name="requirements" rows={4} />
                    </div>
                    <div>
                        <h3 className="text-sm font-medium">Space Details</h3>
                        <p className="text-sm text-muted-foreground">
                            Space: {spaceName}
                            <br />
                            Type: {spaceType}
                            <br />
                            Size: {spaceSize}
                            <br />
                            Rate: {spaceRate}/month
                        </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Submitting...
                            </>
                        ) : (
                            'Submit Request'
                        )}
                    </Button>
                    {message && <p className="mt-2 text-sm text-green-600">{message}</p>}
                    {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                </form>
            </DialogContent>
        </Dialog>
    );
}
