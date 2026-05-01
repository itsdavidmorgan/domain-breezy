import Link from "next/link";
import { Disclosure } from "@/components/landing/Disclosure";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";

export default function HomePage() {
  const gptUrl =
    process.env.DOMAINBREEZY_GPT_URL ?? "https://chatgpt.com/g/g-xxxxxxxx-domainbreezy";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-12">
      <Hero gptUrl={gptUrl} />
      <HowItWorks />
      <Disclosure />

      <footer className="flex flex-wrap items-center gap-4 border-t border-slate-200 pt-8 text-sm text-slate-600">
        <Link className="underline" href="/privacy">
          Privacy Policy
        </Link>
        <Link className="underline" href="/terms">
          Terms
        </Link>
        <Link className="underline" href="/contact">
          Contact
        </Link>
        <span className="ml-auto text-slate-500">Built by DomainBreezy</span>
      </footer>
    </main>
  );
}
