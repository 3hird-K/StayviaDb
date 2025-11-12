"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { motion } from "framer-motion"
import { Mail, Github, Linkedin, Globe } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function ContactForm() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  // ✅ Simple email validation regex
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !message) return toast.error("Please fill out all fields.")
    if (!isValidEmail(email)) return toast.error("Please enter a valid email address.")

    setLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase.from("contact_support").insert([
        {
          email,
          message,
        },
      ])

      if (error) throw error

      toast.success("Message sent successfully!")
      setEmail("")
      setMessage("")
    } catch (err: any) {
      console.error("Supabase insert error:", err.message)
      toast.error("Something went wrong while sending your message.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full mt-8 py-16 bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="max-w-2xl mx-auto px-6 text-center">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-4xl font-bold mb-4"
        >
          Get in Touch
        </motion.h2>

        <p className="text-muted-foreground mb-10">
          We’d love to hear from you. Whether you have a question or just want to say hi, drop us a message!
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 text-left max-w-lg mx-auto"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-input focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="concern" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="concern"
              placeholder="Write your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              rows={5}
              className="border-input focus-visible:ring-2 focus-visible:ring-primary"
            />
          </div>

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "Sending..." : "Send Message"}
          </Button>
        </form>

        <div className="flex justify-center gap-6 mt-12">
          <a
            href="mailto:youremail@example.com"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-6 h-6" />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="w-6 h-6" />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="w-6 h-6" />
          </a>
          <a
            href="https://yourwebsite.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Globe className="w-6 h-6" />
          </a>
        </div>
      </div>
    </section>
  )
}
