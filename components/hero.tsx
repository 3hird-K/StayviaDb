import Image from "next/image";
import UstpLogo from "@/assets/ustp.png";

export function Hero() {
  return (
    <section className="flex flex-col items-center text-center gap-8 py-12">
      {/* Logo */}
      <a
        href="https://www.ustp.edu.ph/"
        target="_blank"
        rel="noreferrer"
      >
        <Image
          src={UstpLogo}
          alt="USTP Logo"
          width={140}
          height={140}
          className="rounded-xl shadow-md"
        />
      </a>

      {/* Title */}
      <div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          StayVia
        </h1>
        <p className="mt-4 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Find your perfect <span className="font-semibold text-primary">boarding house, dorm,</span> or{" "}
          <span className="font-semibold text-primary">apartment</span> near your school — all in one place.
        </p>
        <p className="mt-2 text-sm sm:text-lg text-muted-foreground/80 max-w-2xl mx-auto">
          A trusted student housing platform that connects students with safe, affordable, and verified accommodations close to universities.
        </p>
      </div>

      {/* Divider */}
      <div className="w-full max-w-lg h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent my-6" />
    </section>
  );
}
