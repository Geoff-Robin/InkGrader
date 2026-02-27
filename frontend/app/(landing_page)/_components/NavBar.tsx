import Image from "next/image";

export default function NavBar() {
  return (
    <nav className="fixed top-0 left-0 z-50 w-full">
      <div className="flex items-center justify-between px-8 py-3 bg-white/40 backdrop-blur-xl border-b border-white/30 shadow-sm saturate-150">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="logo"
            width={50}
            height={40}
            className="rounded-lg"
          />
          <span className="font-bold text-xl tracking-tight text-gray-900">
            InkGrader
          </span>
        </div>

        {/* Center Links */}
        <div className="hidden md:flex items-center gap-10 text-sm font-semibold text-gray-700/90">
          <a href="#features" className="hover:text-blue-600 transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-blue-600 transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-4">
          <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors">
            Log in
          </button>
          <button className="px-6 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-all shadow-md active:scale-95">
            Sign up
          </button>
        </div>
      </div>
    </nav>
  );
}
