"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import { registerUser } from "@/app/actions/clientActions/customer";

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [businessType, setBusinessType] = useState(""); // Track Select value

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    // Create FormData from the form
    const formData = new FormData(e.currentTarget);

    // Append businessType (since Select isn't a native form input)
    formData.set("businessType", businessType);

    // Log form data for debugging
    for (let pair of formData.entries()) {
      console.log(pair[0] + ", " + pair[1]);
    }

    try {
      const result = await registerUser(formData);

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: result.message,
        });
        router.push("/register/success");
      } else {
        console.error(result.error);
        toast({
          title: "Registration Failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-h-screen flex flex-col items-center justify-start py-4">
      <div className="mx-auto w-full max-w-[550px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Client Registration
          </h1>
          <p className="text-sm text-muted-foreground">
            Register your company to access our warehouse management system
          </p>
        </div>

        <Card className="overflow-auto max-h-[calc(100vh-200px)]">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>
                Please provide your company details for registration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Person</Label>
                  <Input
                    id="contactName"
                    name="contactName"
                    placeholder="Full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="Job title"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="email@company.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+91 "
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Business Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  placeholder="Enter your business address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    required
                    onValueChange={setBusinessType}
                    value={businessType}
                  >
                    <SelectTrigger id="businessType">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="manufacturing">Manufacturing</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="ecommerce">E-Commerce</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxId">Tax ID / Business Number</Label>
                  <Input
                    id="taxId"
                    name="taxId"
                    placeholder="Enter tax ID"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="requirements">Storage Requirements</Label>
                <Textarea
                  id="requirements"
                  name="requirements"
                  placeholder="Briefly describe your storage needs, including estimated space requirements and duration"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Required Documents</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessLicense" className="text-xs">
                      Business License
                    </Label>
                    <Input
                      id="businessLicense"
                      name="businessLicense"
                      type="file"
                      className="cursor-pointer"
                      accept=".pdf,.jpg,.png"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxCertificate" className="text-xs">
                      Tax Certificate
                    </Label>
                    <Input
                      id="taxCertificate"
                      name="taxCertificate"
                      type="file"
                      className="cursor-pointer"
                      accept=".pdf,.jpg,.png"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" type="button" asChild>
                <Link href="/">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Submitting..." : "Submit Registration"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
