const steps = [
  {
    title: "1. Describe your idea",
    body: "Tell DomainBreezy what you are building - an app, business, product, brand, or side project.",
  },
  {
    title: "2. Get available domains",
    body: "DomainBreezy generates smart domain ideas and checks availability in real time.",
  },
  {
    title: "3. Secure your favorite",
    body: "Choose a domain and complete purchase with total pricing shown (includes a $4.99 DomainBreezy service fee). Some registrars can complete registration in chat.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="rounded-3xl bg-white p-10 shadow-sm ring-1 ring-slate-100">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">How it works</h2>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <article key={step.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
            <h3 className="text-base font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-700">{step.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
