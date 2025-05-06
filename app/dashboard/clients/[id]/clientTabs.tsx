import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"; // Assuming you have Tabs component in your UI lib
import { Suspense } from "react";
import dynamic from "next/dynamic";

// Dynamically import each tab's content
const Spaces = dynamic(() => import("../../../../components/ClientSpaces"));
const Invoices = dynamic(() => import("../../../../components/ClientInvoice"));
const Agreements = dynamic(() => import("../../../../components/ClientAgreement"));
const Support = dynamic(() => import("../../../../components/ClientSupport"));

export function ClientTabs({ clientId }: { clientId: string }) {
  return (
    <Tabs defaultValue="spaces" className="space-y-4">
      {/* Tab List */}
      <TabsList className="grid grid-cols-4 w-full">
        <TabsTrigger value="spaces">Spaces</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
        <TabsTrigger value="agreements">Agreements</TabsTrigger>
        <TabsTrigger value="support">Support</TabsTrigger>
      </TabsList>

      {/* Tab Content */}
      <TabsContent value="spaces">
        <Suspense fallback={<div>Loading Spaces...</div>}>
          <Spaces clientId={clientId} />
        </Suspense>
      </TabsContent>

      <TabsContent value="invoices">
        <Suspense fallback={<div>Loading Invoices...</div>}>
          <Invoices clientId={clientId} searchParams={{ page: undefined }} />
        </Suspense>
      </TabsContent>

      <TabsContent value="agreements">
        <Suspense fallback={<div>Loading Agreements...</div>}>
          <Agreements clientId={clientId} searchParams={{ page: undefined }} />
        </Suspense>
      </TabsContent>

      <TabsContent value="support">
        <Suspense fallback={<div>Loading Support...</div>}>
          <Support clientId={clientId} />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
