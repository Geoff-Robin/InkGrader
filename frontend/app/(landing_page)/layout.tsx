"use client";
import NavBar from "./_components/NavBar";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main>{children}</main>
    </div>
  );
}
