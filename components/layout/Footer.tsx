"use client";

export default function Footer() {
  return (
    <footer className="hidden md:block w-full py-12 px-8 bg-primary mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Logo & Copyright */}
        <div className="flex flex-col items-center md:items-start gap-4">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="relative flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl z-10 text-white">
                sensors
              </span>
              <div className="absolute w-6 h-6 bg-primary-container rounded-full -z-0 opacity-70"></div>
            </div>
            <div className="text-xl font-extrabold tracking-tight font-headline text-white">
              Kivo
            </div>
          </div>
          <p className="text-sm font-['Inter'] text-white">© 2026 Kivo.</p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-wrap justify-center gap-8">
          <a
            href="#"
            className="text-sm font-['Inter'] text-white hover:underline"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-sm font-['Inter'] text-white hover:underline"
          >
            Terms of Service
          </a>
          <a
            href="#"
            className="text-sm font-['Inter'] text-white hover:underline"
          >
            Contact Us
          </a>
        </div>

        {/* Social Icons */}
        <div className="flex gap-6">
          <a href="#" className="text-white">
            <span className="material-symbols-outlined">camera</span>
          </a>
          <a href="#" className="text-white">
            <span className="material-symbols-outlined">alternate_email</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
