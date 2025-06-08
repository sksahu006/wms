import Link from "next/link"
import { CheckCircle2, Package } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/Header"

export default function RegistrationSuccessPage() {
  return (
    <div className="container flex max-h-screen overflow-y-auto overflow-x-hidden w-screen flex-col items-center justify-center">
      {/* <div className="sticky top-0 z-50 bg-white dark:bg-gray-950 shadow">
        <Header />
      </div> */}
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <div className="flex justify-center">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Registration Submitted
          </h1>
          <p className="text-sm text-muted-foreground">
            Your registration is pending approval
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">Thank You!</CardTitle>
            <CardDescription className="text-center">
              Your registration has been submitted successfully
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4 text-black">
            <p className="text-black">
              Your application is now pending approval by our administrators. This process typically takes 1-2 business days.
            </p>
           
            <div className="rounded-md bg-muted p-4 mt-4">
              <p className="text-sm font-medium">What happens next?</p>
              <ol className="text-sm text-left list-decimal pl-4 mt-2 space-y-1">
                <li>Our team reviews your application</li>
                <li>You receive approval notification via email</li>
                <li>You can log in and start managing your warehouse spaces</li>
                <li>Request additional storage space as needed</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
