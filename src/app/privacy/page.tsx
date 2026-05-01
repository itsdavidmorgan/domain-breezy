export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Privacy Policy</h1>
      <p className="mt-6 text-slate-700">
        DomainBreezy collects only the minimum information needed to provide domain
        ideation, availability checks, and payment flow support.
      </p>
      <p className="mt-4 text-slate-700">
        Payment processing is handled by Stripe. Domain registration is completed
        separately through Namecheap.
      </p>
    </main>
  );
}
