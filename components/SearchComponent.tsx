'use client';

import { useState } from "react";
import { Search, SlidersHorizontal, ArrowDownUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

interface InvoiceSearchControlsProps {
  tab: string;
  search: string;
}

export default function InvoiceSearchControls({ tab, search }: InvoiceSearchControlsProps) {
  const [searchValue, setSearchValue] = useState(search);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearchValue(newSearch);
    window.location.href = `/dashboard/invoices?tab=${tab}&search=${encodeURIComponent(newSearch)}`;
  };

  return (
    <div className="flex items-center justify-between">
      <TabsList>
        <TabsTrigger value="all" asChild>
          <Link href={{ pathname: "/dashboard/invoices", query: { tab: "all", search } }}>
            All Invoices
          </Link>
        </TabsTrigger>
        <TabsTrigger value="paid" asChild>
          <Link href={{ pathname: "/dashboard/invoices", query: { tab: "paid", search } }}>
            Paid
          </Link>
        </TabsTrigger>
        <TabsTrigger value="pending" asChild>
          <Link href={{ pathname: "/dashboard/invoices", query: { tab: "pending", search } }}>
            Pending
          </Link>
        </TabsTrigger>
        <TabsTrigger value="overdue" asChild>
          <Link href={{ pathname: "/dashboard/invoices", query: { tab: "overdue", search } }}>
            Overdue
          </Link>
        </TabsTrigger>
      </TabsList>

      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search invoices..."
            className="w-[200px] pl-8"
            value={searchValue}
            onChange={handleSearchChange}
          />
        </div>
        <Button variant="outline" size="icon">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
        <Button variant="outline" size="icon">
          <ArrowDownUp className="h-4 w-4" />
          <span className="sr-only">Sort</span>
        </Button>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
          <span className="sr-only">Download</span>
        </Button>
      </div>
    </div>
  );
}