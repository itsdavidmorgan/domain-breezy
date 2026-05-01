"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";

type SuccessClientProps = {
  domain: string;
};

function buildNamecheapUrl(domain: string) {
  return `https://www.namecheap.com/domains/registration/results/?domain=${encodeURIComponent(domain)}`;
}

export default function SuccessClient({ domain }: SuccessClientProps) {
  const safeDomain = useMemo(() => domain.trim().toLowerCase(), [domain]);
  const namecheapUrl = buildNamecheapUrl(safeDomain);

  useEffect(() => {
    if (!safeDomain) return;
    const timer = setTimeout(() => {
      window.location.href = namecheapUrl;
    }, 4000);
    return () => clearTimeout(timer);
  }, [namecheapUrl, safeDomain]);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <p className="text-sm font-medium text-teal-700">Payment confirmed</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Almost there - let&apos;s finish securing your domain.
        </h1>
        <p className="mt-4 text-slate-700">
          Your DomainBreezy instant secure fee has been processed. To complete
          registration, continue to Namecheap and purchase your selected domain.
        </p>
        {safeDomain ? (
          <p className="mt-3 text-sm text-slate-600">
            Selected domain: <span className="font-semibold text-slate-900">{safeDomain}</span>
          </p>
        ) : null}
        <div className="mt-8">
          <a
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            href={namecheapUrl}
          >
            Complete Registration
          </a>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          If redirect does not happen automatically, use the button above.
        </p>
        <p className="mt-8 text-sm text-slate-500">
          DomainBreezy is not a domain registrar. Domain registration is completed
          separately through Namecheap.
        </p>
        <Link className="mt-6 inline-block text-sm text-slate-600 underline" href="/">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
