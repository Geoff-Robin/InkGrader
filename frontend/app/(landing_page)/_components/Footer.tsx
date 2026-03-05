import Link from "next/link";
import { GraduationCap, Twitter, Linkedin, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border pt-20 pb-10 transition-colors relative overflow-hidden">
      <div className="absolute inset-0 bg-dot-black/[0.05] dark:bg-dot-white/[0.05] -z-10" />

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="md:col-span-2 flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="p-2 rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span className="font-bold text-2xl tracking-tight bg-clip-text text-transparent bg-linear-to-r from-foreground to-foreground/70">
                InkGrader
              </span>
            </Link>
            <p className="text-muted-foreground max-w-sm text-lg leading-relaxed">
              Empowering educators with world-class AI grading tools. Precision, speed, and fairness in every assessment.
            </p>
          </div>

          {/* Links Column */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-lg">Product</h4>
            <ul className="space-y-4">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  API Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="flex flex-col gap-6">
            <h4 className="font-bold text-lg">Legal</h4>
            <ul className="space-y-4">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-sm text-muted-foreground font-medium">
            © {new Date().getFullYear()} InkGrader Inc. All rights reserved. Made for educators.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
            <a href="#" className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted/50 hover:bg-muted transition-colors">
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
