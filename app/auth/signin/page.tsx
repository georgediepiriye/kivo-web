/* eslint-disable @next/next/no-img-element */
"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/layout/NavBar";
import MobileNav from "@/components/layout/MobileNav";

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">
      {/* Desktop/Mobile Top Navigation */}
      <Navbar />

      {/* LEFT SIDE: BRAND/VISUAL (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F9F7F2] items-center justify-center p-12 overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#715800]/5 blur-3xl" />
        <div className="absolute bottom-[5%] right-[-5%] w-[300px] h-[300px] rounded-full bg-[#8b5cf6]/5 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 text-center max-w-md"
        >
          {/* FIX APPLIED HERE:
             - Replaced 'object-cover' with 'object-contain' to show the whole image.
             - Removed 'aspect-square' to respect original image proportions.
          */}
          <Image
            src="/images/signin.jpeg"
            alt="Kivo World"
            width={500}
            height={500}
            className="drop-shadow-2xl mb-10 rounded-[40px] object-contain"
            priority // Good practice for "Above the fold" images
          />
          <h1 className="text-4xl font-black tracking-tighter text-gray-900 mb-4">
            See the city <br />{" "}
            <span className="text-[#715800]">in Real-Time.</span>
          </h1>
          <p className="text-gray-500 font-medium leading-relaxed">
            Join thousands of locals discovering the best events, lounges, and
            hidden gems in Port Harcourt.
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: LOGIN FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-20 relative pt-24 lg:pt-20">
        {/* Logo */}
        <div className="hidden lg:block lg:static lg:mb-12 self-start">
          <Link
            href="/"
            className="text-2xl font-black text-[#715800] tracking-tighter"
          >
            KIVO
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-sm mb-20 lg:mb-0"
        >
          <div className="mb-10">
            <h2 className="text-3xl font-black tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-400 text-sm font-medium">
              Please enter your details to sign in.
            </p>
          </div>

          {/* SOCIAL SIGN IN */}
          <button className="w-full py-4 px-6 border-2 border-gray-100 rounded-2xl flex items-center justify-center gap-4 font-bold text-gray-700 hover:bg-gray-50 transition-all active:scale-[0.98] mb-8">
            <img
              src="/images/google_icon.png"
              className="w-5 h-5"
              alt="Google"
            />
            Continue with Google
          </button>

          <div className="relative mb-8 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100"></div>
            </div>
            <span className="relative bg-white px-4 text-[10px] font-black uppercase text-gray-300 tracking-widest">
              or email
            </span>
          </div>

          {/* FORM */}
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] focus:ring-4 focus:ring-[#715800]/5 outline-none transition-all font-medium text-sm"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-[11px] font-black uppercase text-gray-400 tracking-wider ml-1 block">
                  Password
                </label>
                <Link
                  href="/auth/forgot"
                  className="text-[11px] font-black text-[#715800] uppercase hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] focus:ring-4 focus:ring-[#715800]/5 outline-none transition-all font-medium text-sm"
              />
            </div>

            <button className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-[0.98]">
              Sign In
            </button>
          </form>

          {/* FOOTER */}
          <p className="mt-10 text-center text-sm text-gray-400 font-medium pb-10 lg:pb-0">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-[#715800] font-black hover:underline underline-offset-4"
            >
              Create an account
            </Link>
          </p>
        </motion.div>

        {/* Legal */}
        <div className="hidden sm:block absolute bottom-8 text-center">
          <p className="text-[10px] text-gray-300 font-medium">
            © 2026 Kivo Social. All rights reserved.
          </p>
        </div>
      </div>

      {/* MOBILE TAB BAR NAVIGATION */}
      <MobileNav />
    </div>
  );
}
