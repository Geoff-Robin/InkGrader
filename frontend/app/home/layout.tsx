import { Sidebar } from "../../components/dashboard/Sidebar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col relative overflow-y-auto">
        <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
