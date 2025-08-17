import FAQSection from "@/components/faq";
import { FeaturesSection } from "@/components/features";
import { HeroSection } from "@/components/hero";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";

export default function LandingPage() {
  return (
    <BackgroundBeamsWithCollision className="relative flex flex-col items-center w-full min-h-screen">
      <HeroSection />
      <FeaturesSection />
      <FAQSection />
      <section className="py-20">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">
            Join the Movement
          </h2>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10">
            Connect with the developers who are rewriting the rules of grading—one paper at a time.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="#"
              className="px-6 py-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Discord
            </a>
            <a
              href="#"
              className="px-6 py-3 bg-gradient-to-r from-gray-800 to-gray-900 text-white rounded-xl font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              GitHub
            </a>
            <a
              href="#"
              className="px-6 py-3 bg-gradient-to-r from-blue-400 to-cyan-500 text-white rounded-xl font-semibold shadow-lg transform transition duration-300 hover:scale-105 hover:shadow-2xl"
            >
              Twitter
            </a>
          </div>
        </div>
      </section>

    </BackgroundBeamsWithCollision>
  );
}
