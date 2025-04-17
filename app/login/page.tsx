"use client";

import { useState, useEffect } from "react"; // Add useEffect
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation"; // Add useSearchParams
import { signIn } from "next-auth/react";
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
import { useToast } from "@/hooks/use-toast";

export default function SignInPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle error query params from Google sign-in
  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");
  
    if (error) {
      let errorMessage = "An error occurred during sign-in.";
      if (error === "AccountNotFound") {
        errorMessage = "No account found. Please register first.";
      } else if (error === "NoEmail") {
        errorMessage = "No email provided by Google.";
      } else if (error === "PendingVerification") {
        errorMessage = "Your account is pending for verification. Please check your email for further instructions.";
      } else if (error === "AccountInactive") {
        errorMessage = "Your account is inactive. Please contact support for further assistance.";
      }
  
      setTimeout(() => {
        toast({
          title: "Sign-In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }, 100); 
  
      // Remove the error query from the URL after showing the toast
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      window.history.replaceState({}, document.title, url.toString());
    }
  }, []);  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.ok) {
        toast({
          title: "Sign In Successful",
          description: "Welcome back! You’re now signed in.",
        });
        router.push("/dashboard");
      } else {
        const errorMessage = res?.error || "Invalid email or password";
        toast({
          title: "Sign In Failed",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Sign In Failed",
        description:
          error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      toast({
        title: "Google Sign-In Failed",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-12">
      <div className="mx-auto w-full max-w-[400px] space-y-6">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
          <p className="text-sm text-muted-foreground">
            Access your warehouse management account
          </p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Sign In to Your Account</CardTitle>
              <CardDescription>
                Enter your credentials to access the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="email@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
              <div className="text-sm text-muted-foreground">
                <Link
                  href="/forgot-password"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <svg
            className="mr-2 h-4 w-4"
            aria-hidden="true"
            focusable="false"
            data-prefix="fab"
            data-icon="google"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 488 512"
          >
            <path
              fill="currentColor"
              d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 122.7 24.4 165.8 64.6l-67.2 64.7C317.6 78.1 284.3 64 248 64c-97.2 0-176 79.8-176 176s78.8 176 176 176c89.5 0 141.2-64.4 147.2-122H248v-98.2h240z"
            />
          </svg>
          Continue with Google
        </Button>

        <p className="px-8 text-center text-sm text-muted-foreground">
          Don’t have an account?{" "}
          <Link
            href="/register"
            className="underline underline-offset-4 hover:text-primary"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}