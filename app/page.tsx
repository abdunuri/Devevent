import ExploreBtn from "@/components/exploreBtn";
import Image from "next/image";

const page = () => {
  return (
    <section id="home" className="flex flex-col gap-12 pb-10">
      <div className="relative overflow-hidden rounded-3xl border border-dark-200 bg-gradient-to-br from-[#0d1a22] via-[#0a1218] to-[#091015] p-8 card-shadow sm:p-12">
        <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -right-16 h-64 w-64 rounded-full bg-blue/20 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-primary">TECHVENT</p>
            <h1>The hub for every Tech event in Addis</h1>
            <p className="subheading max-w-2xl text-left">
              From high-energy hackathons to deep-dive engineering meetups, discover events that sharpen your skills,
              expand your network, and launch your next opportunity.
            </p>

            <div className="mt-7 flex flex-wrap gap-2">
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Hackathons</span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Meetups</span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Conferences</span>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Workshops</span>
            </div>

            <ExploreBtn />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="relative h-52 overflow-hidden rounded-2xl border border-dark-200 bg-dark-100">
              <Image
                src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80"
                alt="People attending a tech conference"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>
            <div className="relative h-52 overflow-hidden rounded-2xl border border-dark-200 bg-dark-100">
              <Image
                src="https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80"
                alt="Developers collaborating in a workshop"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-dark-200 bg-dark-100/70 p-5">
          <h3 className="mb-2 text-xl">Discover Fast</h3>
          <p className="text-light-200 text-sm">Browse upcoming events in seconds, with details that help you decide quickly.</p>
        </article>
        <article className="rounded-xl border border-dark-200 bg-dark-100/70 p-5">
          <h3 className="mb-2 text-xl">Book Easily</h3>
          <p className="text-light-200 text-sm">Reserve your spot directly from each event page with simple, frictionless booking.</p>
        </article>
        <article className="rounded-xl border border-dark-200 bg-dark-100/70 p-5">
          <h3 className="mb-2 text-xl">Grow Network</h3>
          <p className="text-light-200 text-sm">Meet founders, builders, and hiring teams shaping the Addis tech ecosystem.</p>
        </article>
      </div>

      <div className="rounded-2xl border border-dark-200 bg-dark-100/80 p-7 text-center">
        <h3 className="mb-2">Ready to explore what’s happening this week?</h3>
        <p className="text-light-200 mb-5 text-sm">Find your next event and join the community building Ethiopia’s tech future.</p>
        <div className="flex justify-center">
          <ExploreBtn />
        </div>
      </div>
    </section>
  );
};

export default page;