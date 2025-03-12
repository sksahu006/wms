import { CheckCircle } from "lucide-react";

export default function ServicesPage() {
  const services = [
    "Inventory Management",
    "Order Fulfillment",
    "Warehouse Space Optimization",
    "Real-time Tracking",
    "Reporting and Analytics",
    "Client Management",
    "Invoicing and Billing",
    "Support and Maintenance",
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Our Services
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Comprehensive warehouse management solutions tailored to your needs.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              {services.map((service, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                  <h2 className="text-xl font-semibold">{service}</h2>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}