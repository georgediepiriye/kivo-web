"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/NavBar";
import { Cpu, Map, Users, Zap } from "lucide-react";
import Footer from "@/components/layout/Footer";
import MobileNav from "@/components/layout/MobileNav";

export default function AboutPage() {
  const values = [
    {
      icon: <Zap className="text-[#715800]" />,
      title: "Real-Time Pulse",
      desc: "We don't do 'yesterday'. Kivo shows you what is happening right now, from the smallest pop-up to the biggest concert.",
    },
    {
      icon: <Map className="text-[#715800]" />,
      title: "Hyper-Local",
      desc: "Built specifically for Port Harcourt. We know the streets, the vibes, and the hidden gems that global apps miss.",
    },
    {
      icon: <Users className="text-[#715800]" />,
      title: "Community First",
      desc: "Kivo isn't just an app; it's a social catalyst. We bridge the gap between digital discovery and real-life connection.",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 pb-20">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#715800]/5 text-[#715800] rounded-full text-xs font-bold tracking-widest uppercase mb-6"
          >
            <Cpu size={14} /> Our Story
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black tracking-tighter mb-6"
          >
            We’re mapping the <br />
            <span className="text-[#715800] italic text-5xl md:text-7xl">
              heartbeat of the city.
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl text-gray-600 text-lg leading-relaxed"
          >
            Kivo was born in Port Harcourt out of a simple frustration: knowing
            that something great is happening nearby, but not knowing where. We
            built the Kivo Scout to ensure you never miss a move again.
          </motion.p>
        </div>

        {/* Background Decorative Element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#715800]/5 rounded-full blur-3xl -mr-48 -mt-48" />
      </section>

      {/* THE MISSION SECTION */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <Image
              src="/images/about.png"
              alt="Kivo Mission"
              width={600}
              height={450}
              className="rounded-[40px] shadow-2xl object-cover"
            />
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl hidden md:block">
              <p className="text-3xl font-black text-[#715800]">100%</p>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                PH City Local
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-3xl font-black tracking-tight">
              Meet your new digital guide.
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Kivo is a real-time social discovery platform designed to help you
              navigate your city’s social landscape. Whether you’re looking for
              a low-key lounge, a high-energy concert, or a spontaneous football
              match, Kivo maps it for you.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Powered by our <strong>Kivo AI Scout</strong>, we analyze
              thousands of data points to bring you suggestions that actually
              match your vibe. No more boring weekends. No more &quot;I wish I
              knew.&quot;
            </p>
            <div className="pt-4">
              <Link
                href="/map"
                className="px-8 py-4 bg-black text-white font-bold rounded-full hover:scale-105 transition inline-block"
              >
                Start Exploring
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES GRID */}
      <section className="bg-gray-50 py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black tracking-tight">
              What we stand for
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <div
                key={i}
                className="bg-white p-10 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition"
              >
                <div className="w-12 h-12 bg-[#715800]/10 rounded-2xl flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold mb-4">{v.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto bg-black text-white p-12 rounded-[48px] relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-black mb-6">
              Ready to see your city in a new light?
            </h2>
            <p className="text-gray-400 mb-8 px-4">
              Join thousands of locals who are already using Kivo to discover
              the best of Port Harcourt.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/signup"
                className="px-8 py-4 bg-[#715800] text-white font-bold rounded-full hover:bg-[#5a4600] transition"
              >
                Join Kivo
              </Link>
              <Link
                href="/contact"
                className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition border border-white/10"
              >
                Contact Us
              </Link>
            </div>
          </div>
          {/* Subtle logo pulse in background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#715800]/20 rounded-full blur-[80px]" />
        </div>
      </section>

      <MobileNav />
      <Footer />
    </div>
  );
}
