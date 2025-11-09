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
import { Eye, EyeOff } from "lucide-react"; // 👈 added icons

import Logo from "@/assets/Logologin.png";
import LogoLight from "@/assets/loginlogolight.png";
import GoogleLogo from "@/assets/googlelogo.png";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isPasswordPwned, isPasswordStrong } from "@/lib/passwordUtils";
import { getAllCourse } from "@/lib/supabase/course";
import { useQuery } from "@tanstack/react-query";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<string | null>(null);
  const [isBreached, setIsBreached] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState("");

  const router = useRouter();


  const { data: courses = [], isLoading: coursesLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: getAllCourse,
  })

  console.log(selectedCourse)
  console.log(role)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClient();
    setIsLoading(true);
    setError(null);
    
    if (!role) {
      setError("Please select a role before signing up.");
      setIsLoading(false);
      return;
    }
    if (!selectedCourse) {
      setError("Please select a course before signing up.");
      setIsLoading(false);
      return;
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    const strengthError = isPasswordStrong(password);
    if (strengthError) {
      setError(strengthError);
      setIsLoading(false);
      return;
    }

    const isPwned = await isPasswordPwned(password);
    if (isPwned) {
      setError("This password has appeared in data breaches. Please use another one.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: { firstname, lastname, role },
        },
      });

      if (error) throw error;

      if (data.user) {
        const { data: existingUser, error: selectError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (existingUser) {
          setError("Account already exists.");
          setEmail("");
          setPassword("");
          setRepeatPassword("");
          await supabase.auth.admin.deleteUser(data.user.id);
          return;
        }

        if (selectError && selectError.code !== "PGRST116") {
          console.error("Error checking user existence:", selectError);
          setError("Something went wrong checking existing users.");
          return;
        }

        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            firstname,
            lastname,
            role,
            email,
            course_id: selectedCourse, 
          },
        ]);

        

        if (insertError) {
          console.error("Insert into users table failed:", insertError);
          setError("Account created but profile insert failed: " + insertError.message);
          return;
        }

        router.push("/auth/sign-up-success");
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/protected`,
        },
      });
      if (error) throw error;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Google sign-up failed");
    }
  };

  return (
    <Card className="w-full max-w-7xl shadow-lg">
      <CardHeader className="flex flex-col items-center text-center mt-0 pt-0">
        <Link href={"/"}>
          <div className="flex justify-center">
            <Image
              src={LogoLight}
              alt="Logo Light"
              width={180}
              height={180}
              className="block dark:hidden"
            />
            <Image
              src={Logo}
              alt="Logo Dark"
              width={180}
              height={180}
              className="hidden dark:block"
            />
          </div>
        </Link>

        <CardTitle className="text-2xl font-bold pt-0 mt-0">Create Account</CardTitle>
        <CardDescription>Fill in your details to get started</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstname">First Name</Label>
              <Input
                id="firstname"
                type="text"
                placeholder="Sarah"
                required
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastname">Last Name</Label>
              <Input
                id="lastname"
                type="text"
                placeholder="Discaya"
                required
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={(value) => setRole(value)} required>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Account type</SelectLabel>
                  <SelectItem value="Instructor">Instructor</SelectItem>
                  <SelectItem value="Student">Student</SelectItem>
                  <SelectItem value="Admin" disabled>
                    Admin
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="course">Course</Label>
            <Select
              value={selectedCourse}
              onValueChange={(value) => setSelectedCourse(value)}
              required
              disabled={coursesLoading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={coursesLoading ? "Loading..." : "Select Course"} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Course</SelectLabel>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>        


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

          {/* 🔹 Password with toggle + strength meter */}
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter a password"
                required
                value={password}
                onChange={async (e) => {
                  const value = e.target.value;
                  setPassword(value);

                  const strengthError = isPasswordStrong(value);
                  setPasswordStrength(strengthError ? strengthError : "Strong password");

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
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

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
          </div>

          {/* 🔹 Confirm Password with toggle */}
          <div className="grid gap-2">
            <Label htmlFor="repeat-password">Confirm Password</Label>
            <div className="relative">
              <Input
                id="repeat-password"
                type={showRepeatPassword ? "text" : "password"}
                placeholder="Confirm password"
                required
                value={repeatPassword}
                onChange={(e) => setRepeatPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                className="absolute right-2 top-2.5 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {showRepeatPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-2">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full py-4" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Sign up"}
          </Button>

          <div className="text-center text-sm mt-2">
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-indigo-600 dark:text-indigo-400 hover:underline underline-offset-4"
            >
              Login
            </Link>
          </div>
        </form>

        <div className="flex items-center gap-2 my-4">
          <div className="h-px flex-1 bg-muted" />
          <span className="text-sm text-muted-foreground">Or continue with</span>
          <div className="h-px flex-1 bg-muted" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full flex items-center gap-2 py-5"
          onClick={handleGoogleSignUp}
        >
          <Image src={GoogleLogo} alt="Google" width={20} height={20} />
          Continue with Google
        </Button>
      </CardContent>
    </Card>
  );
}
