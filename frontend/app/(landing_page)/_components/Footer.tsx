import Image from "next/image";

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-black border-t border-gray-200 dark:border-white/10 py-12 mt-10 transition-colors">
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Image src="/logo.png" alt="logo" width={40} height={40} />
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
                InkGrader
              </span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
              Precision grading and feedback tools for the modern educator.
            </p>
          </div>

          {/* Links Column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900 dark:text-white">Product</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a
                  href="#features"
                  className="hover:text-blue-600 transition-colors"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="hover:text-blue-600 transition-colors"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  API
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-gray-900 dark:text-white">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-blue-600 transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-500">
            © {new Date().getFullYear()} InkGrader Inc. All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-gray-400 underline underline-offset-4">
            <a href="#">Twitter</a>
            <a href="#">LinkedIn</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
