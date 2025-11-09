import { EnvVarWarning } from "@/components/env-var-warning"
import { AuthButton } from "@/components/auth-button"
import { Hero } from "@/components/hero"
import { hasEnvVars } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import Logo from "@/assets/icon.png"
import LogoLight from "@/assets/icon.png"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* Navbar */}
        <nav className="sticky top-0 z-50 w-full flex justify-center border-b border-b-foreground/10 bg-background/80 backdrop-blur">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/protected"}>
                <div className="flex justify-center">
                  <Image
                    src={LogoLight}
                    alt="Logo Light"
                    width={120}
                    height={60}
                    className="block dark:hidden"
                  />
                  <Image
                    src={Logo}
                    alt="Logo Dark"
                    width={120}
                    height={60}
                    className="hidden dark:block"
                  />
                </div>
              </Link>
            </div>
            {!hasEnvVars ? <EnvVarWarning /> : <AuthButton />}
          </div>
        </nav>

        {/* Page Content */}
        <div className="flex-1 flex flex-col gap-10 max-w-5xl p-5">
          <Hero />

        </div>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Developed by{" "}
            <a
              href="https://www.ustp.edu.ph/"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              USTP student
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
