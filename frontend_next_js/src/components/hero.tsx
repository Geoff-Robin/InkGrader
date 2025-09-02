import React from "react";

export function HeroSection() {
  return (
    <div className="mt-40">
      <h2 className="text-2xl relative z-20 md:text-4xl lg:text-7xl font-bold text-center text-black dark:text-white font-sans tracking-tight">
        Smarter Grading with AI{" "}
        <br/>
        <div className="relative mx-auto inline-block w-max [filter:drop-shadow(0px_1px_3px_rgba(27,_37,_80,_0.14))]">
          <div className="absolute left-0 top-[1px] bg-clip-text bg-no-repeat text-transparent bg-gradient-to-r py-4 from-blue-500 via-cyan-500 to-green-500 [text-shadow:0_0_rgba(0,0,0,0.1)]">
            <span className="">Meet InkGrader.</span>
          </div>
          <div className="relative bg-clip-text text-transparent bg-no-repeat bg-gradient-to-r from-blue-500 via-cyan-500 to-green-500 py-4">
            <span className="">Meet InkGrader.</span>
          </div>
        </div>
      </h2>
      <p className="relative z-20 mt-6 text-lg md:text-xl text-center text-muted-foreground max-w-2xl mx-auto">
        An AI-powered tool that grades assignments, gives feedback, and saves time
        — so educators can focus on teaching, not paperwork.
      </p>
    </div>
  );
}
