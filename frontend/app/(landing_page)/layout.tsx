"use client";
import NavBar from "./_components/NavBar";

export default function LandingPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <NavBar />
      <main className="min-h-0 flex-1">{children}</main>
    </div>
  );
}
