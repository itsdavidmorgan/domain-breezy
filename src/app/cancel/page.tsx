import Link from "next/link";

type CancelPageProps = {
  searchParams: Promise<{
    domain?: string;
  }>;
};

export default async function CancelPage({ searchParams }: CancelPageProps) {
  const params = await searchParams;
  const domain = (params.domain ?? "").trim().toLowerCase();

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          No problem - your DomainBreezy checkout was canceled.
        </h1>
        <p className="mt-4 text-slate-700">
          Your domain has not been registered yet. You can return to ChatGPT and
          choose another domain, or try again when you&apos;re ready.
        </p>
        {domain ? (
          <p className="mt-3 text-sm text-slate-600">
            Last selected domain: <span className="font-semibold text-slate-900">{domain}</span>
          </p>
        ) : null}
        <div className="mt-8 flex gap-4">
          <Link
            className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
            href="/"
          >
            Back to DomainBreezy
          </Link>
        </div>
      </div>
    </main>
  );
}
