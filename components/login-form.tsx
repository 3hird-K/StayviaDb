"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

import Logo from "@/assets/icon.png";
import LogoLight from "@/assets/icon.png";
import RightImage from "@/assets/stay-build.png"
import GoogleLogo from "@/assets/googlelogo.png";
import { Eye, EyeOff } from "lucide-react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // Update this route to redirect to an authenticated route. The user already has an active session.
      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${window.location.origin}/protected` },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Google login failed");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* --- Left Side (Form) --- */}
          <div className="p-6 md:p-8">
            <CardHeader className="flex flex-col items-center space-y-2 text-center p-0 mb-4">
              <Link href={"/"}>
                <div className="flex justify-center">
                  <Image
                    src={LogoLight}
                    alt="Logo Light"
                    width={130}
                    height={130}
                    className="block dark:hidden"
                  />
                  <Image
                    src={Logo}
                    alt="Logo Dark"
                    width={130}
                    height={130}
                    className="hidden dark:block"
                  />
                </div>
              </Link>

              <CardTitle className="text-2xl font-bold">
                Welcome Back
              </CardTitle>
              <CardDescription>
                Enter your credentials to sign in to your account
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password with Toggle */}
              <div className="grid gap-2 relative">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-2">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>

              {/* <div className="text-center text-sm mt-2">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/sign-up"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
                >
                  Sign up
                </Link>
              </div> */}
            </form>

            {/* Separator */}
            <div className="flex items-center gap-2 my-6">
              <div className="h-px flex-1 bg-muted" />
              <span className="text-sm text-muted-foreground">
                Or continue with
              </span>
              <div className="h-px flex-1 bg-muted" />
            </div>

            {/* Google Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full flex items-center gap-2 py-5"
              onClick={handleGoogleLogin}
            >
              <Image src={GoogleLogo} alt="Google" width={20} height={20} />
              Continue with Google
            </Button>

            {/* Footer Note */}
            <p className="mt-6 text-xs text-center text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="/terms" className="underline hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          {/* --- Right Side (Image) --- */}
          <div className="bg-muted relative hidden md:block">
            {/* <img
              src={RightImage}
              alt="Login Illustration"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            /> */}

            <Image
              src={RightImage}
              alt="Logo Light"
              className="absolute inset-0 h-full w-full dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
