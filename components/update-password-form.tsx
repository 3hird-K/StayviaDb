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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

// 👇 import your utils
import { isPasswordPwned, isPasswordStrong } from "@/lib/passwordUtils";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [isBreached, setIsBreached] = useState(false);

  const router = useRouter();

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Strength check
      const strengthError = isPasswordStrong(password);
      if (strengthError) {
        setError(strengthError);
        setIsLoading(false);
        return;
      }

      // ✅ Breach check
      const compromised = await isPasswordPwned(password);
      if (compromised) {
        setError("This password has been found in a data breach. Please choose another.");
        setIsLoading(false);
        return;
      }

      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      router.push("/protected");
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="password">New password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={async (e) => {
                      const value = e.target.value;
                      setPassword(value);

                      // Live strength check
                      const strengthError = isPasswordStrong(value);
                      setPasswordStrength(
                        strengthError ? strengthError : "Strong password"
                      );

                      // Live breach check if long enough
                      if (value.length > 6) {
                        const pwned = await isPasswordPwned(value);
                        setIsBreached(pwned);
                      } else {
                        setIsBreached(false);
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* 🔹 Strength + breach indicator */}
              {password && (
                <div className="mt-2 text-sm">
                  <div
                    className={`h-2 rounded-full ${
                      isBreached
                        ? "bg-red-500"
                        : passwordStrength === "Strong password"
                        ? "bg-green-500"
                        : "bg-yellow-500"
                    }`}
                  />
                  <p
                    className={`mt-1 ${
                      isBreached
                        ? "text-red-600"
                        : passwordStrength === "Strong password"
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {isBreached
                      ? "This password has appeared in data breaches."
                      : passwordStrength}
                  </p>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save new password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
