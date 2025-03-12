import Link from "next/link";
import { Package } from "lucide-react";

export default function Header() {
  return (
    <header className="px-4 lg:px-6 h-14 flex items-center">
      <Link className="flex items-center justify-center" href="/">
        <Package className="h-6 w-6" />
        <span className="sr-only">Warehouse Management System</span>
      </Link>
      <nav className="ml-auto flex gap-4 sm:gap-6">
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/">
          Home
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/about">
          About
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/services">
          Services
        </Link>
        <Link className="text-sm font-medium hover:underline underline-offset-4" href="/login">
          Login
        </Link>
      </nav>
    </header>
  );
}