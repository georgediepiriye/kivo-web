"use client";
import Image from "next/image";
import Link from "next/link";

export default function HeroAndAssistant() {
  return (
    <>
      {/* ===== HERO SECTION ===== */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12 md:gap-16 pt-32">
        {/* LEFT SIDE */}
        <div className="flex-1 space-y-6 md:space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary-container text-black rounded-full text-xs font-bold tracking-widest uppercase">
            <span className="material-symbols-outlined text-sm">bolt</span>
            Live in port harcourt
          </div>

          <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.05] text-on-surface">
            See what’s happening{" "}
            <span className="text-primary italic">near you</span>.
          </h1>

          <p className="text-base md:text-lg text-gray-600 max-w-xl leading-relaxed">
            Discover local events and activities in{" "}
            <strong>Port Harcourt</strong>. Meet people in real life, and join
            or host meetups around you. Explore the map, join in minutes, or
            create your own event.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/map">
              <button className="px-6 md:px-8 py-3 md:py-4 bg-primary text-white font-bold rounded-full text-lg hover:scale-105 transition">
                Get started
              </button>
            </Link>

            <button className="px-6 md:px-8 py-3 md:py-4 bg-gray-200 text-black font-bold rounded-full text-lg flex items-center gap-2 hover:bg-gray-300 transition">
              <span className="material-symbols-outlined">play_circle</span>
              See how it works
            </button>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex-1 relative w-full md:w-auto">
          <div className="aspect-[4/5] md:aspect-[3/4] rounded-2xl overflow-hidden shadow-lg relative rotate-0 md:rotate-2">
            <Image
              src="/images/hero.png"
              alt="People socializing"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="absolute -bottom-10 -left-10 bg-white/80 backdrop-blur-lg p-5 rounded-2xl shadow-lg max-w-[240px] hidden lg:block -rotate-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center">
                <span className="material-symbols-outlined">celebration</span>
              </div>

              <div>
                <p className="font-bold text-sm">Sunday Brunch</p>
                <p className="text-xs text-gray-500">Old GRA, Port Harcourt</p>
              </div>
            </div>

            <p className="text-xs text-gray-600">
              “Found this through Kivo — easily one of the best spots this
              weekend.”
            </p>
          </div>
        </div>
      </section>

      {/* ===== AI / SMART ASSISTANT SECTION ===== */}
      <section className="bg-surface py-20">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* IMAGE */}
          <div className="md:w-1/2 relative">
            <Image
              src="/images/ai_landing.png"
              alt="Kivo AI Assistant"
              width={600}
              height={600}
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* TEXT */}
          <div className="md:w-1/2 flex flex-col gap-6">
            <h2 className="text-3xl md:text-4xl font-extrabold text-on-surface">
              Your AI Companion for Local Experiences
            </h2>

            <p className="text-lg text-gray-700">
              Kivo understands what you love and brings the best local events,
              activities, and social experiences straight to you—so you’re never
              left wondering what to do.
            </p>

            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  place
                </span>
                <div>
                  <strong>Location-aware suggestions:</strong> Discover nearby
                  events instantly.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  lightbulb
                </span>
                <div>
                  <strong>Smart recommendations:</strong> AI learns what you
                  love.
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-3xl">
                  notifications
                </span>
                <div>
                  <strong>Real-time alerts:</strong> Never miss spontaneous
                  activities.
                </div>
              </li>
            </ul>

            {/* WhatsApp Bot Button with icon */}
            <a
              href="https://wa.me/2348012345678?text=Hi!%20I%20want%20to%20chat%20with%20Kivo%20AI%20Assistant"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-fit bg-[#25D366] hover:bg-[#1DA851] text-white px-6 py-3 rounded-full font-semibold flex items-center gap-3 transition"
            >
              <span className="material-symbols-outlined text-2xl">chat</span>
              Chat with Kivo on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
