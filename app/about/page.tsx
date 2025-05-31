import Header from "@/components/Header";
import homelogoimage from "../../public/wmsa.png"; // Make sure this image exists in /public folder
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow">
        <Header />
      </div>
 
      {/* Hero Section with Background Image */}
      <main className="flex-1">
        <section
          className="relative w-full py-12 md:py-24 lg:py-32 bg-cover bg-center"
          style={{
            backgroundImage: `url(${homelogoimage.src})`,
          }}
        >
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60 z-10" />

          {/* Content over image */}
          <div className="relative z-20 container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-white">
                  About Us
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-200 md:text-xl">
                  Learn about our mission to revolutionize warehouse management.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Our Story</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Founded in 2010, our Warehouse Management System has grown from a small startup to a leading provider
                  of logistics solutions. We've helped thousands of businesses optimize their warehouse operations and
                  improve their bottom line.
                </p>
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Our Mission</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  We're on a mission to simplify warehouse management for businesses of all sizes. By leveraging
                  cutting-edge technology and user-friendly interfaces, we aim to make warehouse operations more
                  efficient, cost-effective, and scalable.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
