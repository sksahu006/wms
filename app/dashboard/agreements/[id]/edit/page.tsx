'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useParams, useRouter } from 'next/navigation';
import { getAgreement, updateAgreement } from '@/app/actions/aggrementActions/aggrements';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { getSpaces, getUsers } from '@/app/actions/clientActions/customer';
import { z } from 'zod';  // Zod import
import { Info, InfoIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Define Zod schema for form validation
const agreementSchema = z.object({
  spaceId: z.string().cuid(),
  userId: z.string().cuid(),
  clientName: z.string().optional().nullable(),
  contactPerson: z.string().optional().nullable(),
  spaceType: z.enum(["REGULAR", "COLD", "HAZARDOUS", "OUTDOOR"]),
  areaSqft: z.number(),
  monthlyRatePerSqft: z.number().optional().nullable(),
  monthlyRentAmount: z.number(),
  handoverDate: z.string().optional().nullable(),
  rentStartDate: z.string(),
  rateEscalationDate: z.string().optional().nullable(),
  rateEscalationPercent: z.number().optional().nullable(),
  agreementPeriod: z.number().int().optional().nullable(),
  electricityCharges: z.number().optional().nullable(),
  waterCharges: z.number().optional().nullable(),
  remarks: z.string().optional().nullable(),
  status: z.enum(["PENDING", "ACTIVE", "INACTIVE"]).default("PENDING"),
});

export default function EditAgreementPage() {
  const { id } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [agreement, setAgreement] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [agreementCode, setAgreementCode] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchAgreement = async () => {
      if (!id || typeof id !== 'string') {
        setError('Invalid agreement ID');
        return;
      }
      const result = await getAgreement(id);
      if (result.success) {
        setAgreement(result.agreement);
        setUserId(result.agreement?.user.id || '');
        setSpaceId(result.agreement?.space.id || '');
      } else {
        setError(result.error ?? 'Failed to fetch agreement');
      }
    };

    fetchAgreement();
  }, [id]);

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
    const spacesResult = await getSpaces({ page: 1, pageSize: 10, search, SpaceStatus: "AVAILABLE" });
    if (spacesResult.success) {
      return spacesResult.data.map((space) => ({
        id: space.id,
        label: space.spaceCode || space.name || space.id,
      }));
    }
    return [];
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    const formData = {
      userId: userId,
      spaceId: spaceId,
      clientName: (form as any).clientName.value || null,
      contactPerson: (form as any).contactPerson.value || null,
      spaceType: (form as any).spaceType.value,
      areaSqft: parseFloat((form as any).areaSqft.value),
      monthlyRatePerSqft: parseFloat((form as any).monthlyRatePerSqft.value) || null,
      monthlyRentAmount: parseFloat((form as any).monthlyRentAmount.value),
      handoverDate: (form as any).handoverDate.value || null,
      rentStartDate: (form as any).rentStartDate.value,
      rateEscalationDate: (form as any).rateEscalationDate.value || null,
      rateEscalationPercent: parseFloat((form as any).rateEscalationPercent.value) || null,
      agreementPeriod: parseInt((form as any).agreementPeriod.value, 10) || null,
      electricityCharges: parseFloat((form as any).electricityCharges.value) || null,
      waterCharges: parseFloat((form as any).waterCharges.value) || null,
      remarks: (form as any).remarks.value || null,
      status: (form as any).status.value || 'PENDING',
    };

    try {
      agreementSchema.parse(formData);

      setLoading(true);

      if (!id || typeof id !== 'string') {
        setError('Invalid agreement ID');
        return;
      }

      const formDataToSend = new FormData();

      // Append basic fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formDataToSend.append(key, value.toString());
        }
      });

      // 🔄 Upload the document to Cloudinary
       let documentUrl: string | null = agreement?.documentUrl;
      const fileInput = form.querySelector<HTMLInputElement>('input[name="document"]');
      if (fileInput && fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];

        if (file.size > 10 * 1024 * 1024) {
          alert('File size should not exceed 10MB.');
          return; // Stop execution
        }

        const uploadData = new FormData();
        uploadData.append('file', file);
        uploadData.append('upload_preset', 'warehouse'); // Replace with your actual unsigned preset

        const cloudinaryRes = await fetch(
          'https://api.cloudinary.com/v1_1/dqboora0r/auto/upload', // Cloudinary API URL
          {
            method: 'POST',
            body: uploadData,
          }
        );

        const cloudinaryJson = await cloudinaryRes.json();

        if (!cloudinaryRes.ok || !cloudinaryJson.secure_url) {
          throw new Error(cloudinaryJson.error?.message || 'Cloudinary upload failed');
        }

        documentUrl = cloudinaryJson.secure_url;
      }

      // Append the Cloudinary URL to the form data if the document was uploaded
      if (documentUrl) {
        formDataToSend.append('documentUrl', documentUrl);
      }

      // 🔁 Call the backend API with the form data
      const result = await updateAgreement(id, formDataToSend);

      if (result.success) {
        router.push('/dashboard/agreements');
      } else {
        setError(result.error ?? 'Failed to update agreement');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors.map(e => e.message).join(', '));
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!agreement) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <Card className='shadow-md border-[1px] border-gray-300'>
        <CardHeader className="flex flex-col gap-1">
          <CardTitle className="text-[25px]">
            Edit Agreement
          </CardTitle>
          <div className="flex items-center text-sm text-blue-800 bg-blue-100 border border-blue-300 rounded-md p-2">
            <Info className="w-4 h-4 mr-1" />
            <span>Kindly read the info while updating agreement at status</span>
          </div>
        </CardHeader>
        <CardContent >
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
            {error && <p className="text-red-500 col-span-2">{error}</p>}

            {/* Space Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="spaceId">Space</Label>
              <SearchableCombobox
                value={spaceId}
                onValueChange={setSpaceId}
                placeholder="Select a space"
                searchPlaceholder="Search spaces..."
                fetchData={fetchSpaces}
              />
            </div>

            {/* User Selection */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="userId">Clients</Label>
              <SearchableCombobox
                value={userId}
                onValueChange={setUserId}
                placeholder="Select a user"
                searchPlaceholder="Search users..."
                fetchData={fetchUsers}
              />
            </div>

            {/* Client Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                name="clientName"
                defaultValue={agreement.clientName || ''}
              />
            </div>

            {/* Contact Person */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                defaultValue={agreement.contactPerson}
                required
              />
            </div>

            {/* Rent Start Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="rentStartDate">Rent Start Date</Label>
              <Input
                id="rentStartDate"
                name="rentStartDate"
                type="date"
                defaultValue={agreement.rentStartDate ? new Date(agreement.rentStartDate).toISOString().split('T')[0] : ''}

              />
            </div>

            {/* Handover Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="handoverDate">Handover Date</Label>
              <Input
                id="handoverDate"
                name="handoverDate"
                type="date"
                defaultValue={agreement.handoverDate ? new Date(agreement.handoverDate).toISOString().split('T')[0] : ''}

              />
            </div>

            {/* Rate Escalation Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="rateEscalationDate">Rate Escalation Date</Label>
              <Input
                id="rateEscalationDate"
                name="rateEscalationDate"
                type="date"
                defaultValue={agreement.rateEscalationDate ? new Date(agreement.rateEscalationDate).toISOString().split('T')[0] : ''}
              />
            </div>

            {/* Rate Escalation Percent */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="rateEscalationPercent">Rate Escalation (%)</Label>
              <Input
                id="rateEscalationPercent"
                name="rateEscalationPercent"
                type="number"
                defaultValue={agreement.rateEscalationPercent ? new Date(agreement.rateEscalationPercent).toISOString().split('T')[0] : ''}
              />
            </div>

            {/* Agreement Period (Months) */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="agreementPeriod">Agreement Period (Months)</Label>
              <Input
                id="agreementPeriod"
                name="agreementPeriod"
                type="number"
                defaultValue={agreement.agreementPeriod}

              />
            </div>

            {/* Electricity Charges */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="electricityCharges">Electricity Charges</Label>
              <Input
                id="electricityCharges"
                name="electricityCharges"
                type="number"
                defaultValue={agreement.electricityCharges}

              />
            </div>

            {/* Water Charges */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="waterCharges">Lease deed</Label>
              <Input
                id="waterCharges"
                name="waterCharges"
                type="number"
                defaultValue={agreement.waterCharges}

              />
            </div>

            {/* Remarks */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                name="remarks"
                defaultValue={agreement.remarks || ''}
              />
            </div>

            {/* Space Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="spaceType">Space Type</Label>
              <Select name="spaceType" defaultValue={agreement.spaceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select space type" />
                </SelectTrigger>
                <SelectContent className='text-white'>
                  <SelectItem value="REGULAR">Regular</SelectItem>
                  <SelectItem value="COLD">Cold</SelectItem>
                  <SelectItem value="HAZARDOUS">Hazardous</SelectItem>
                  <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                  <SelectItem value="AMENITY">Amenity</SelectItem>
                  <SelectItem value="CARPET">Carpet</SelectItem>
                  <SelectItem value="UTILITY">Utility</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Area (Sqft) */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="areaSqft">Area (Sqft)</Label>
              <Input
                id="areaSqft"
                name="areaSqft"
                type="number"
                defaultValue={agreement.areaSqft}
                required
              />
            </div>

            {/* Monthly Rate Per Sqft */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyRatePerSqft">Monthly Rate Per Sqft</Label>
              <Input
                id="monthlyRatePerSqft"
                name="monthlyRatePerSqft"
                type="number"
                defaultValue={agreement.monthlyRatePerSqft || 0}
              />
            </div>

            {/* Monthly Rent Amount */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="monthlyRentAmount">Security Deposit</Label>
              <Input
                id="monthlyRentAmount"
                name="monthlyRentAmount"
                type="number"
                defaultValue={agreement.monthlyRentAmount}
                required
              />
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              <div className='flex gap-2 text-blue-800 bg-blue-100 border border-blue-300 p-1'><Label htmlFor="status">Status (Hover over me)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className='hover:cursor-pointer'>
                        <InfoIcon className="w-4 h-4 text-gray-500" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="h-32 w-80 bg-black">
                      <p className="text-xs text-white p-2">
                        You can inactivate the agreement you no longer need and the assigned space will be available for new agreements. Hense you don't need to delete the agreement.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>


              </div>

              <Select name="status" defaultValue={agreement.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className='text-white'>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
              <div className="flex flex-col gap-2">
              <Label htmlFor="document">Upload Agreement Document</Label>
              <Input
                className="p-2"
                id="document"
                name="document"
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.png"
              />
              {agreement.documentUrl && (
                <p className="text-sm text-gray-500">
                  Current document:{' '}
                  <a href={agreement.documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    View
                  </a>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="col-span-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Updating...' : 'Update Agreement'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>

  );
}
