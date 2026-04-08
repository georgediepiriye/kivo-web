/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";

export default function SignUpPage() {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Top Navigation */}
      <Navbar />

      {/* LEFT SIDE: BRAND/VISUAL (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F9F7F2] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#715800]/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 text-center max-w-md"
        >
          <Image
            src="/images/signup.jpeg"
            alt="Join Kivo"
            width={450}
            height={450}
            className="drop-shadow-xl mb-12 mx-auto rounded-[40px]"
          />
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4 leading-tight">
            The city is waiting <br />{" "}
            <span className="text-[#715800]">for you.</span>
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed px-6">
            Create an account to save your favorite spots, get personalized
            event alerts, and connect with the Port Harcourt scene.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: SIGN UP FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-20 relative pt-24 lg:pt-8 overflow-y-auto">
        {/* Header / Logo (Hidden on mobile to avoid double logo with Navbar) */}
        <div className="hidden lg:block absolute top-8 left-8">
          <Link
            href="/"
            className="text-xl font-black text-[#715800] tracking-tighter"
          >
            KIVO
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm py-12 mb-20 lg:mb-0"
        >
          <div className="mb-8">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Join the Scene
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              Be the first to know where the move is.
            </p>
          </div>

          {/* SOCIAL SIGN UP */}
          <button className="w-full py-4 px-6 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-4 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] mb-8">
            <img
              src="/images/google_icon.png"
              className="w-5 h-5"
              alt="Google"
            />
            Sign up with Google
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black uppercase text-gray-300 tracking-widest">
              or use email
            </span>
          </div>

          {/* SIGN UP FORM */}
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  First Name
                </label>
                <input
                  type="text"
                  placeholder="John"
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  Last Name
                </label>
                <input
                  type="text"
                  placeholder="Doe"
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                Password
              </label>
              <input
                type="password"
                placeholder="Create a password"
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm"
              />
            </div>

            <div className="pt-2">
              <p className="text-[11px] text-gray-400 mb-6 leading-relaxed">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-[#715800] font-bold">
                  Terms
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#715800] font-bold">
                  Privacy Policy
                </Link>
                .
              </p>

              <button className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-[0.98]">
                Create Account
              </button>
            </div>
          </form>

          {/* FOOTER */}
          <p className="mt-8 text-center text-sm text-gray-400 font-medium pb-10">
            Already a member?{" "}
            <Link
              href="/auth/signin"
              className="text-[#715800] font-black hover:underline underline-offset-4"
            >
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Bottom Navigation */}
      <MobileNav />
    </div>
  );
}
