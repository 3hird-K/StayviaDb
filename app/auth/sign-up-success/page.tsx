import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-[100vh] w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="shadow-lg rounded-xl border">
          <CardHeader className="flex flex-col items-center text-center gap-2 py-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
            <CardTitle className="text-2xl font-bold">
              Thank you for signing up!
            </CardTitle>
            <CardDescription className="text-gray-500">
              Check your email to confirm
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 text-center">
              You&apos;ve successfully signed up. Please check your email to
              confirm your account before signing in.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center py-6">
            <Link href="/protected" passHref>
              <Button className="w-full bg-green-500 hover:bg-green-600 text-white">
                Back to Dashboard
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
