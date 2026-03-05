import { Navbar } from "../../components/dashboard/Navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 relative overflow-y-auto">
        <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
