
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Calendar, CheckCircle2, Download, FileText, Mail, MapPin, Phone, User, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster, toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { getClientById, updateUser } from '@/app/actions/clientActions/customer';
import { Status } from '@prisma/client';

// Define client type based on User schema
interface Client {
  id: string;
  name: string;
  contactName: string;
  position?: string;
  email: string;
  phone: string;
  address: string;
  status: Status;
  businessType: string;
  taxId: string;
  requirements?: string;
  businessLicense?: string;
  taxCertificate?: string;
  created: string;
}

export default function PendingClientDetailsPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingClientId, setLoadingClientId] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [client, setClient] = useState<Client | null>(null);

  // Fetch client data
  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await getClientById(params.id);
        if (response.success && response.data) {
          // Map nullable fields to empty strings or suitable defaults
          setClient({
            id: response.data.id,
            name: response.data.name ?? '',
            contactName: response.data.contactName ?? '',
            position: response.data.position ?? '',
            email: response.data.email ?? '',
            phone: response.data.phone ?? '',
            address: response.data.address ?? '',
            status: response.data.status,
            businessType: response.data.businessType ?? '',
            taxId: response.data.taxId ?? '',
            requirements: response.data.requirements ?? '',
            businessLicense: response.data.businessLicense ?? '',
            taxCertificate: response.data.taxCertificate ?? '',
            created: typeof response.data.created === 'string'
              ? response.data.created
              : response.data.created?.toISOString() ?? '',
          });
        } else {
          toast.error(response.error || 'Failed to fetch client', { duration: 3000 });
          router.push('/dashboard/clients/pending');
        }
      } catch (error) {
        toast.error('Failed to fetch client data', { duration: 3000 });
        router.push('/dashboard/clients/pending');
      } finally {
        setInitialLoading(false);
      }
    };
    fetchClient();
  }, [params.id, router]);

  const handleUpdateUser = async (formData: FormData) => {
    const id = formData.get('id') as string;
    const status = formData.get('status') as Status;

    try {
      setLoadingClientId(id);
      setLoading(true);
      await updateUser(formData);
      toast.success(`Client ${status === 'ACTIVE' ? 'approved' : 'rejected'} successfully!`, { duration: 3000 });
      router.push('/dashboard/clients/pending');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update client';
      toast.error(message, { duration: 3000 });
    } finally {
      setLoading(false);
      setLoadingClientId(null);
    }
  };

  if (initialLoading || !client) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="flex flex-col gap-4 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster position="top-right" richColors />
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild className="border-gray-300">
          <Link href="/dashboard/clients/pending">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Pending Client Details</h1>
        <div className="ml-auto space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="text-red-600 border-red-300 hover:bg-red-50"
                disabled={loading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Reject Client Registration</DialogTitle>
                <DialogDescription>
                  Are you sure you want to reject this client registration? The client will be notified via email.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {}} // No-op to close dialog
                  className="border-none text-white bg-gradient-to-r from-gray-300 to-gray-500 hover:from-gray-400 hover:to-gray-600"
                >
                  Cancel
                </Button>
                <form action={handleUpdateUser}>
                  <input type="hidden" name="id" value={client.id} />
                  <input type="hidden" name="email" value={client.email || ''} />
                  <input type="hidden" name="status" value="INACTIVE" />
                  <Button
                    type="submit"
                    variant="destructive"
                    disabled={loading && loadingClientId === client.id}
                    className="bg-gradient-to-r from-red-600 to-red-800 ml-4 hover:from-red-700 hover:to-red-900"
                  >
                    {loading && loadingClientId === client.id ? (
                      <span className="inline-flex items-center">
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Rejecting...
                      </span>
                    ) : (
                      'Confirm Rejection'
                    )}
                  </Button>
                </form>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <form action={handleUpdateUser}>
            <input type="hidden" name="id" value={client.id} />
            <input type="hidden" name="email" value={client.email || ''} />
            <input type="hidden" name="status" value="ACTIVE" />
            <Button
              type="submit"
              disabled={loading && loadingClientId === client.id}
              className="bg-gradient-to-r from-green-500 to-teal-500 mt-3 text-white hover:from-green-600 hover:to-teal-600"
            >
              {loading && loadingClientId === client.id ? (
                <span className="inline-flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Approving...
                </span>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Approve Client
                </>
              )}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-3 bg-white shadow-md">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className='text-black'>Client Information</CardTitle>
              <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                <Clock className="mr-1 h-3 w-3" />
                {client.status}
              </Badge>
            </div>
            <CardDescription>Registration ID: {client.id}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <Building2 className="mr-2 h-4 w-4 text-gray-400" />
                <span className='text-black'>{client.name}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="mr-2 h-4 w-4 text-gray-400" />
                <span className='text-black'>{client.contactName}</span>
                {client.position && <span className="text-gray-400 ml-1">({client.position})</span>}
              </div>
              <div className="flex items-center text-sm">
                <Mail className="mr-2 h-4 w-4 text-gray-400" />
                <span className='text-black'>{client.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="mr-2 h-4 w-4 text-gray-400" />
                <span className='text-black'>{client.phone}</span>
              </div>
              <div className="flex items-start text-sm">
                <MapPin className="mr-2 h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                <span className='text-black'>{client.address}</span>
              </div>
              <div className="flex items-center text-sm">
                <Calendar className="mr-2 h-4 w-4 text-gray-400" />
                <span className='text-black'>Submitted: {new Date(client.created).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-2">
              <h3 className="text-sm font-medium mb-2">Business Details</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">Business Type:</span>
                  <p className='text-black'>{client.businessType}</p>
                </div>
                <div>
                  <span className="text-gray-400">Tax ID:</span>
                  <p className='text-black'>{client.taxId}</p>
                </div>
              </div>
            </div>

            {client.requirements && (
              <div className="pt-2">
                <h3 className="text-sm font-medium mb-2">Storage Requirements</h3>
                <p className="text-sm">{client.requirements}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* <Card className="md:col-span-4 bg-white shadow-md">
          <CardHeader>
            <CardTitle>Registration Documents</CardTitle>
            <CardDescription>Review submitted documents</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="documents" className="space-y-4">
              <TabsList className="grid grid-cols-2 w-full bg-gray-100">
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="verification">Verification</TabsTrigger>
              </TabsList>

              <TabsContent value="documents">
                <div className="space-y-4">
                  {[
                    { name: 'Business License', file: client.businessLicense },
                    { name: 'Tax Certificate', file: client.taxCertificate },
                  ]
                    .filter((doc) => doc.file)
                    .map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-500" />
                          <span>{doc.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(doc.file, '_blank')}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    ))}
                </div>
              </TabsContent>

              <TabsContent value="verification">
                <div className="space-y-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Verification Checklist</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-business" className="mr-2" />
                        <label htmlFor="verify-business" className="text-sm">Business license is valid</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-tax" className="mr-2" />
                        <label htmlFor="verify-tax" className="text-sm">Tax ID is verified</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-address" className="mr-2" />
                        <label htmlFor="verify-address" className="text-sm">Business address is confirmed</label>
                      </div>
                      <div className="flex items-center">
                        <input type="checkbox" id="verify-contact" className="mr-2" />
                        <label htmlFor="verify-contact" className="text-sm">Contact information is valid</label>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Notes</h3>
                    <textarea
                      placeholder="Add verification notes here..."
                      className="min-h-[100px] w-full border border-gray-300 rounded-md p-2 text-sm"
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild className="border-gray-300">
              <Link href="/dashboard/clients/pending">Back to List</Link>
            </Button>
            <div className="space-x-2">
              <Button
                variant="outline"
                className="text-red-600 border-red-300"
                onClick={() => {}}
                disabled={loading}
              >
                Reject
              </Button>
              <form action={handleUpdateUser} className="inline-block">
                <input type="hidden" name="id" value={client.id} />
                <input type="hidden" name="email" value={client.email || ''} />
                <input type="hidden" name="status" value="ACTIVE" />
                <Button
                  type="submit"
                  disabled={loading && loadingClientId === client.id}
                  className="bg-gradient-to-r from-green-500 to-teal-500 text-white"
                >
                  Approve
                </Button>
              </form>
            </div>
          </CardFooter>
        </Card> */}
      </div>
    </div>
  );
}