"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import Navbar from "@/components/layout/NavBar";
import { Eye, EyeOff } from "lucide-react"; // Added Eye icons

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Added toggle state

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role: string) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const signupAction = async () => {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const { firstName, lastName, email, password, role } = formData;
      const payload = {
        name: `${firstName} ${lastName}`.trim(),
        email,
        password,
        role,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Signup failed");
      }

      localStorage.setItem("token", data.token);
      return data;
    };

    toast.promise(
      signupAction(),
      {
        loading: "Creating your Kivo account...",
        success: () => {
          setLoading(false);
          setTimeout(() => router.push("/map"), 1200);
          return `Welcome to Kivo, ${formData.firstName}!`;
        },
        error: (err) => {
          setLoading(false);
          return err.message;
        },
      },
      {
        style: {
          borderRadius: "15px",
          background: "#111",
          color: "#fff",
          fontSize: "14px",
          fontWeight: "bold",
        },
        success: {
          iconTheme: { primary: "#22c55e", secondary: "#fff" },
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full flex bg-white font-sans text-gray-900 overflow-x-hidden">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />

      {/* LEFT SIDE: BRAND/VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#F9F7F2] items-center justify-center p-12 overflow-hidden">
        <div className="absolute top-[-5%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#715800]/5 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
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
            Explore the <br />{" "}
            <span className="text-[#715800]">garden city.</span>
          </h1>
        </motion.div>
      </div>

      {/* RIGHT SIDE: SIGN UP FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 md:p-20 relative pt-24 lg:pt-8 overflow-y-auto">
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
              Be the first to know where the move is in Port Harcourt.
            </p>
          </div>

          {/* ROLE SELECTION */}
          <div className="mb-8">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-3 block">
              I am joining as...
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleRoleSelect("user")}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                  formData.role === "user"
                    ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                    : "border-gray-100 text-gray-400 hover:border-gray-200"
                }`}
              >
                Normal User
              </button>
              <button
                type="button"
                onClick={() => handleRoleSelect("organizer")}
                className={`py-3 rounded-2xl font-bold text-sm transition-all border-2 ${
                  formData.role === "organizer"
                    ? "border-[#715800] bg-[#715800]/5 text-[#715800]"
                    : "border-gray-100 text-gray-400 hover:border-gray-200"
                }`}
              >
                Event Organizer
              </button>
            </div>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                  First Name
                </label>
                <input
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
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
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
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
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                type="email"
                placeholder="name@example.com"
                className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider ml-1 mb-2 block">
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-[#715800] outline-none transition-all font-medium text-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#715800] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                disabled={loading}
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl shadow-black/10 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Joining...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

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
    </div>
  );
}
