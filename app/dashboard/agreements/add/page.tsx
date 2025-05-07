'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { createAgreement } from '@/app/actions/aggrementActions/aggrements';
import { SearchableCombobox } from '@/components/ui/SearchableCombobox';
import { getSpaces, getUsers } from '@/app/actions/clientActions/customer';

export default function AddAgreementPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const [spaceId, setSpaceId] = useState('');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const router = useRouter();

  const fetchUsers = async (search: string) => {
    const usersResult = await getUsers({ page: 1, pageSize: 10, search });
    if (usersResult.success) {
      return usersResult.data.map((user) => ({
        id: user.id,
        label: user.name || user.id, // Fallback to email or id if name doesn't exist
      }));
    }
    return [];
  };

  const fetchSpaces = async (search: string) => {
    const spacesResult = await getSpaces({ page: 1, pageSize: 10, search, SpaceStatus: 'AVAILABLE' });
    console.log('Fetched spaces:', spacesResult);
    if (spacesResult.success) {
      return spacesResult.data.map((space) => ({
        id: space.id,
        label: space.spaceCode || space.name || space.id,
      }));
    }
    return [];
  };

  // Handle file upload to Cloudinary
  const handleFileUpload = async (file: File) => {
    const uploadData = new FormData();
    uploadData.append('file', file);
    uploadData.append('upload_preset', 'warehouse'); // Replace with your preset

    try {
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

      return cloudinaryJson.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      setError('Document upload failed');
      setLoading(false);
      return null;
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    // Collect form data
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    formData.set('userId', userId);
    formData.set('spaceId', spaceId);

    // Handle document file upload if a file is selected
    const fileInput = form.querySelector<HTMLInputElement>('input[name="document"]');
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      const uploadedDocumentUrl = await handleFileUpload(file);
      if (uploadedDocumentUrl) {
        formData.set('documentUrl', uploadedDocumentUrl);
      } else {
        setLoading(false);
        return; // If document upload fails, stop form submission
      }
    }

    // Submit form to the backend
    const result = await createAgreement(formData);
    if (result.success) {
      router.push('/dashboard/agreements');
    } else {
      setError(result.error ?? null);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Create New Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {error && <p className="text-red-500 col-span-2">{error}</p>}

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

            <div className="flex flex-col gap-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input id="contactPerson" name="contactPerson" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rentStartDate">Rent Start Date</Label>
              <Input id="rentStartDate" name="rentStartDate" type="date" required />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="handoverDate">Handover Date</Label>
              <Input id="handoverDate" name="handoverDate" type="date" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rateEscalationDate">Rate Escalation Date</Label>
              <Input id="rateEscalationDate" name="rateEscalationDate" type="date" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="rateEscalationPercent">Rate Escalation (%)</Label>
              <Input
                id="rateEscalationPercent"
                name="rateEscalationPercent"
                type="number"
                step="0.1"
                placeholder="e.g., 5.0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="agreementPeriod">Agreement Period (months)</Label>
              <Input id="agreementPeriod" name="agreementPeriod" type="number" placeholder="e.g., 12" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="electricityCharges">Electricity Charges</Label>
              <Input
                id="electricityCharges"
                name="electricityCharges"
                type="number"
                step="0.01"
                placeholder="e.g., 100.00"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="waterCharges">Water Charges</Label>
              <Input
                id="waterCharges"
                name="waterCharges"
                type="number"
                step="0.01"
                placeholder="e.g., 50.00"
              />
            </div>

            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea id="remarks" name="remarks" placeholder="Any additional notes" />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="PENDING">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="document">Upload Agreement Document</Label>
              <Input id="document" name="document" type="file" accept=".pdf,.doc,.docx,.jpg,.png" />
            </div>

            <div className="col-span-2 flex justify-end">
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Create Agreement'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}