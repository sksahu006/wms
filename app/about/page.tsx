import Header from "@/components/Header";

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
          className="w-full py-12 md:py-24 lg:py-32 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://img.freepik.com/free-photo/warehouse-industrial-building-interior-with-people-forklifts-handling-goods-storage-area_342744-1498.jpg?uid=R160018945&ga=GA1.1.1155705999.1735793162&semt=ais_hybrid')`,
          }}
        >
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none text-white">
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
              {/* Adding a related image */}
              {/* <div className="lg:col-span-2 flex justify-center">
                <img
                  src="https://img.freepik.com/free-vector/illustration-business-target-icon_53876-5898.jpg?uid=R160018945&ga=GA1.1.1155705999.1735793162&semt=ais_hybrid"
                  alt="Warehouse interior"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxWidth: "700px" }}
                />
              </div> */}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}