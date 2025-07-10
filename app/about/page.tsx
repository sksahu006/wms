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
                <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl text-blue-600">
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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800 p-10">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-start">
              {/* Column 1: Our Story */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-blue-600">Our Story</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Established in 2013, our company began its journey in the state of Odisha with primarily serving esteemed clients such as Indian Railways and Rail Vikas Nigam Limited (RVNL). Today, we proudly serve a diverse client base that includes Indian Railways, RVNL, National Highways (NH), National Highways Authority of India (NHAI), and various State Government infrastructure projects.
                  <br /><br />
                  Driven by a commitment to excellence, quality execution, and innovation, we have grown our annual turnover to approximately ₹900 Crores, establishing ourselves as a trusted name in the infrastructure and construction sector.
                  <br /><br />
                  As we continue to evolve with changing industry dynamics, we are excited to announce the launch of a new venture in Warehouse Management.
                  <br /><br />
                  Recognizing the increasing need for streamlined logistics and inventory solutions, we have developed a cutting-edge Warehouse Management Portal to simplify operations, enhance efficiency, and provide clients with real-time visibility and control over their warehouse activities.
                </p>
              </div>

              {/* Column 2: Our Mission */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-blue-600">Our Mission</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Our mission is to revolutionize warehouse management by delivering intelligent, technology-driven solutions tailored to businesses of all sizes. Through the integration of advanced digital tools and intuitive user interfaces, we empower organizations to optimize their warehouse operations—making them more efficient, cost-effective, and scalable.
                  <br /><br />
                  We are committed to simplifying complex logistics challenges, enhancing operational visibility, and driving measurable value for our clients. By fostering innovation, reliability, and continuous improvement, we aim to set a new benchmark in the warehouse management landscape.
                </p>
              </div>
            </div>

          </div>
        </section>
      </main>
    </div>
  );
}
