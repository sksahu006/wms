"use client";

import Link from "next/link";
import { Package, Menu, X } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b shadow-sm">
      <div className="container mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-gray-900 dark:text-white">
          <Image
            src="/logowms.jpeg" alt=" " height={52} width={52} />
          <span className="text-sm font-semibold">SCPL Warehouse</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            About
          </Link>
          <Link
            href="/services"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
          >
            Services
          </Link>
          <Link
            href="/login"
            className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 dark:text-gray-300 focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isOpen && (
        <div className="md:hidden bg-white dark:bg-gray-950 border-t shadow-sm px-4 pb-4">
          <nav className="flex flex-col space-y-2 mt-2">
            <Link
              href="/"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              About
            </Link>
            <Link
              href="/services"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-colors"
            >
              Services
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="text-sm font-medium text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition-colors text-center"
            >
              Login
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
