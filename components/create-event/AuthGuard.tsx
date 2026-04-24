/* eslint-disable @typescript-eslint/no-explicit-any */
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface AuthGuardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthGuardModal = ({ isOpen, onClose }: AuthGuardProps) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.9, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        className="relative w-full max-w-sm bg-white rounded-[40px] p-10 text-center shadow-2xl"
      >
        <div className="w-20 h-20 bg-[#715800]/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <ShieldCheck size={40} className="text-[#715800]" />
        </div>

        <h3 className="text-2xl font-black uppercase tracking-tighter mb-3 leading-tight">
          Members Only <br /> Access
        </h3>

        <p className="text-gray-500 text-sm font-medium mb-10 leading-relaxed px-2">
          Only verified Kivo members can broadcast moves. Sign in to share your
          event with Port Harcourt.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push("/auth/signin")}
            className="w-full py-5 bg-[#715800] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[#715800]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Sign In to Kivo <ArrowRight size={14} />
          </button>

          <button
            onClick={onClose}
            className="w-full py-4 text-gray-400 font-black text-[10px] uppercase hover:text-gray-600 transition-colors"
          >
            Continue Browsing
          </button>
        </div>
      </motion.div>
    </div>
  );
};
