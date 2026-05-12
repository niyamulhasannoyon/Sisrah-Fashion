import { LOOMRA_COPY } from '@/lib/constants/copy';

export function Newsletter() {
  return (
    <section className="bg-loomra-black py-24 text-loomra-white">
      <div className="mx-auto max-w-6xl px-6 sm:px-8">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr] items-center">
          <div>
            <p className="text-small uppercase tracking-[0.32em] text-loomra-red">Stay in the loop</p>
            <h2 className="text-heading font-bold text-loomra-white">{LOOMRA_COPY.cta.newsletterJoin}</h2>
            <p className="mt-4 max-w-xl text-body text-loomra-white/70">
              Get early access to new fabric drops, local launches, and exclusive member offers.
            </p>
          </div>
          <form className="flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="min-w-0 flex-1 rounded-none border border-loomra-white bg-black/10 px-4 py-3 text-loomra-white placeholder:text-loomra-white/50 outline-none"
            />
            <button type="submit" className="rounded-none bg-loomra-red px-6 py-3 text-small font-bold uppercase tracking-widest text-loomra-white transition-colors hover:bg-red-800">
              {LOOMRA_COPY.cta.newsletterSubscribe}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

