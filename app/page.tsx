"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { ArrowRight, Package, Truck, Users, Warehouse } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import homelogoimage from "../public/homephoto.jpeg";
import sliderbottom from "../public/slider_bottom.png";
import Image from "next/image";
import bgshape from "../public/choose_bg_shape01.png";

export default function Home() {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      controls.start("visible");
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow">
        <Header />
      </div>
      <main className="flex-1">
        {/* <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-gray-50 dark:bg-gray-900">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="flex flex-col items-center space-y-4 text-center lg:text-left">
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-2"
                >
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                    Warehouse Management System
                  </h1>
                  <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                    Streamline your warehouse operations with our cutting-edge management system designed for efficiency and scalability.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="space-x-4"
                >
                  <Button asChild>
                    <Link href="/login">Get Started</Link>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/about">Learn More</Link>
                  </Button>
                </motion.div>
              </div>
              <motion.div
                variants={imageVariants}
                initial="hidden"
                animate="visible"
                className="flex justify-center"
              >
                <img
                  src="https://images.pexels.com/photos/4481328/pexels-photo-4481328.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                  alt="Modern warehouse interior"
                  className="max-w-full h-auto rounded-lg shadow-lg"
                  style={{ maxWidth: "500px" }}
                />
              </motion.div>
            </div>
          </div>
        </section> */}
        <section
          className="relative w-full min-h-screen bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: `url(${homelogoimage.src})`,
          }}
        >
          {/* Overlay for dark tint */}
          <div className="absolute inset-0 bg-black/40 z-0" />


          {/* Animated content container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10 container px-4 md:px-6 text-center"
          >
            <div className="flex flex-col items-center space-y-6">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
                Warehouse Management System
              </h1>
              <p className="max-w-[700px] text-lg sm:text-xl text-gray-200">
                Streamline your warehouse operations with our cutting-edge management system designed for efficiency and scalability.
              </p>
              <div className="space-x-4 pt-4">
                <Button asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/about">Learn More</Link>
                </Button>
              </div>
            </div>
          </motion.div>
          <div className="absolute bottom-0 left-0 w-full z-10">
            <Image
              src={sliderbottom}
              alt="Slider bottom decoration"
              className="w-full h-auto"
              priority
            />
          </div>
        </section>

        <section className=" relative w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <motion.div
              ref={ref}
              variants={containerVariants}
              initial="hidden"
              animate={controls}
              className="grid gap-6 lg:grid-cols-3 lg:gap-12"
            >
              <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-500 text-white">
                  <Package className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Inventory Management</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Keep track of your inventory in real-time with our advanced tracking system.
                </p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white">
                  <Truck className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Logistics Optimization</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Optimize your logistics with intelligent routing and scheduling algorithms.
                </p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-500 text-white">
                  <Users className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Client Management</h2>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Manage your clients efficiently with our comprehensive client portal.
                </p>
              </motion.div>
            </motion.div>

          </div>

          <div className="hidden lg:block absolute bottom-[-50px] left-0 w-full z-0 pointer-events-none">
            <Image
              src={bgshape}
              alt="Background shape top"
              className="w-full h-auto"
              priority
            />
          </div>

        </section>

        {/* New Section: Why Choose Us */}
        <section className=" relative w-full py-12 md:py-24 lg:py-32">
          <div className=" hidden lg:block absolute   lg:bottom-[-70px]  left-0 w-full z-0 pointer-events-none">
            <Image
              src={bgshape}
              alt="Background shape top"
              className="w-full h-auto"
              priority
            />
          </div>


          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-6"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Why Choose Our System?
              </h2>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Discover the benefits of partnering with us for your warehouse management needs.
              </p>
            </motion.div>
            <div className="grid gap-8 mt-12 md:grid-cols-2 lg:grid-cols-3">
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <Warehouse className="h-12 w-12 text-blue-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Scalable Solutions</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Adaptable to businesses of all sizes, from small startups to large enterprises.
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <Truck className="h-12 w-12 text-green-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Real-Time Insights</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Access up-to-the-minute data to make informed decisions quickly.
                </p>
              </motion.div>
              <motion.div
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                <Users className="h-12 w-12 text-purple-500 mx-auto" />
                <h3 className="text-xl font-semibold text-center">Dedicated Support</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center">
                  Our team is here 24/7 to ensure your operations run smoothly.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Updated Call-to-Action Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center justify-center space-y-6 text-center"
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                Ready to Transform Your Warehouse?
              </h2>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join thousands of businesses that have optimized their operations with our warehouse management system.
              </p>
              <div className="space-x-4">
                <Button asChild>
                  <Link
                    href="/register"
                    className="inline-flex h-10 items-center justify-center rounded-md bg-gray-900 px-8 text-sm font-medium text-gray-50 shadow transition-colors hover:bg-gray-900/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus-visible:ring-gray-300"
                  >
                    Sign Up Now
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                {/* <Button variant="outline" asChild>
                  <Link href="/contact">Contact Sales</Link>
                </Button> */}
              </div>
            </motion.div>
          </div>
        </section>
        <footer className="bg-white text-gray-800 px-6 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Column 1: Logo + Description */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/logowms.jpeg" alt="Logo" className="h-10" />
                <h2 className="text-lg font-bold">SCPL Warehouse</h2>
              </div>
              <p className="text-sm leading-relaxed">
                The Company is a leading construction company involved in the construction of works
                with Railways & Highways having bridges, industrial buildings, Railway Track works
                projects and works at Visakhapatnam Steel Plant & onshore works.
              </p>
            </div>

            {/* Column 2: Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm">
                {[ "about", "services","contact Us"].map(link => (
                  <li key={link}>
                    <Link href={`${link}`} className="hover:text-purple-700 capitalize">{link}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Get in Touch */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white bg-blue-800 px-3 py-1 inline-block rounded">Get in Touch</h3>
              <p className="text-sm bg-purple-100 p-3 rounded">
                Regd. Office: OU-522, 5th Floor, Esplanade Commercial Development Unit No.32,721,
                Rasulgarh, Bhubaneswar – 751 010, Khurda
              </p>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-purple-800">📞</span>
                  <span>0674-2548394</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-800">✉️</span>
                  <span>info@shivamcondev.com</span>
                </div>
              </div>
            </div>

          </div>
        </footer>

      </main>
    </div>
  );
}