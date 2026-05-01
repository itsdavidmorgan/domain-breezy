type HeroProps = {
  gptUrl: string;
};

export function Hero({ gptUrl }: HeroProps) {
  return (
    <section className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100">
      <p className="text-sm font-medium uppercase tracking-wide text-teal-700">
        DomainBreezy
      </p>
      <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-slate-900 md:text-5xl">
        Find and secure the perfect domain in seconds.
      </h1>
      <p className="mt-5 max-w-3xl text-base leading-7 text-slate-700 md:text-lg">
        DomainBreezy is an AI-powered domain assistant that helps you turn an idea
        into available domain names - then guides you through securing your
        favorite.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          className="inline-flex rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700"
          href={gptUrl}
          target="_blank"
          rel="noreferrer"
        >
          Try DomainBreezy in ChatGPT
        </a>
        <a
          className="inline-flex rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          href="#how-it-works"
        >
          How it works
        </a>
      </div>
    </section>
  );
}
