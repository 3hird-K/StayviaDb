
"use client"
import * as React from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, EyeOff } from "lucide-react"
import { isPasswordPwned, isPasswordStrong } from "@/lib/passwordUtils"
import { IconPlus } from "@tabler/icons-react"

export function AdminRegisterDialog() {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [repeatPassword, setRepeatPassword] = React.useState("")
  const [firstname, setFirstname] = React.useState("")
  const [lastname, setLastname] = React.useState("")
  const [role, setRole] = React.useState("")
  const [error, setError] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showPassword, setShowPassword] = React.useState(false)
  const [showRepeatPassword, setShowRepeatPassword] = React.useState(false)
  const [passwordStrength, setPasswordStrength] = React.useState<string | null>(null)
  const [isBreached, setIsBreached] = React.useState(false)

  const router = useRouter()

  const handleClose = () => {
    setFirstname("")
    setLastname("")
    setPassword("")
    setRepeatPassword("")
    setRole("")
    setError(null)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (!role) {
      setError("Please select a role before signing up.")
      setIsLoading(false)
      return
    }

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    const strengthError = isPasswordStrong(password)
    if (strengthError) {
      setError(strengthError)
      setIsLoading(false)
      return
    }

    const isPwned = await isPasswordPwned(password)
    if (isPwned) {
      setError("This password has appeared in data breaches. Please use another one.")
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/protected`,
          data: { firstname, lastname, role },
        },
      })

      if (error) throw error

      if (data.user) {
        const { data: existingUser, error: selectError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single()

        if (existingUser) {
          setError("Account already exists.")
          setEmail("")
          setPassword("")
          setRepeatPassword("")
          await supabase.auth.admin.deleteUser(data.user.id)
          return
        }

        if (selectError && selectError.code !== "PGRST116") {
          console.error("Error checking user existence:", selectError)
          setError("Something went wrong checking existing users.")
          return
        }

        const { error: insertError } = await supabase.from("users").insert([
          {
            id: data.user.id,
            firstname,
            lastname,
            role,
            email,
          },
        ])

        if (insertError) {
          console.error("Insert into users table failed:", insertError)
          setError("Account created but profile insert failed: " + insertError.message)
          return
        }

        router.push("/auth/sign-up-success")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconPlus />
          Administrator
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Administrator Account</DialogTitle>
          <DialogDescription>Create and Register</DialogDescription>
        </DialogHeader>

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
                  <SelectItem value="Admin">Administrator</SelectItem>
                  <SelectItem value="Admin/Instructor">Administrator/Instructor</SelectItem>
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

          {/* Password */}
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
                  const value = e.target.value
                  setPassword(value)

                  const strengthError = isPasswordStrong(value)
                  setPasswordStrength(strengthError ? strengthError : "Strong password")

                  if (value.length > 6) {
                    const pwned = await isPasswordPwned(value)
                    setIsBreached(pwned)
                  } else {
                    setIsBreached(false)
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

          {/* Confirm Password */}
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

          <DialogFooter className="flex justify-between">
            <DialogClose asChild>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating account..." : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
