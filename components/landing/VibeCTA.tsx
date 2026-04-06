"use client";

export default function VibeCTA() {
  return (
    <section className="max-w-7xl mx-auto px-8 mb-32">
      <div className="bg-primary rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
        {/* Background SVG */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg
            height="100%"
            width="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d="M0 100 C 20 0 50 0 100 100"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* Headline */}
        <h2
          style={{ color: "white" }}
          className="text-5xl md:text-7xl font-black font-headline tracking-tighter mb-8 relative z-10"
        >
          Discover what’s happening around you
        </h2>

        {/* Subtitle */}
        <p
          style={{ color: "white" }}
          className="text-xl md:text-2xl font-medium opacity-90 max-w-2xl mx-auto mb-12 relative z-10"
        >
          Discover events, activities, and experiences happening around you — or
          create your own in minutes.
        </p>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-6 relative z-10">
          <button className="bg-surface-container-lowest text-primary px-12 py-5 rounded-full font-black text-xl hover:scale-105 transition-transform editorial-shadow">
            Get started
          </button>

          <button
            style={{ color: "white" }}
            className="border-2 border-on-primary px-12 py-5 rounded-full font-black text-xl hover:bg-on-primary hover:text-primary transition-all"
          >
            Learn more
          </button>
        </div>
      </div>
    </section>
  );
}
