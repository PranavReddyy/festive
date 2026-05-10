import { Navbar } from "@/components/common/Navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 lg:px-10 py-12 lg:py-16">
        {children}
      </main>
    </div>
  );
}
