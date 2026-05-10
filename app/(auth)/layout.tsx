import Link from "next/link";
import { APP_NAME } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <aside className="relative hidden lg:flex flex-col justify-between p-12 border-r border-border">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight inline-flex items-baseline"
        >
          <span className="italic">F</span>
          <span>estive</span>
        </Link>

        <div className="space-y-8 max-w-md">
          <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
            Issue 01 — Live, in person
          </p>
          <h1 className="font-display text-[3.25rem] leading-[1.02]">
            A quieter way to <em className="italic font-display">find</em> what
            you didn&rsquo;t know you were looking for.
          </h1>
          <p className="text-[15px] leading-relaxed text-muted-foreground text-pretty">
            From listening rooms and design conferences to weekend festivals.
            Curated, ad-free, and built for the kind of evenings worth
            remembering.
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} {APP_NAME}
        </p>
      </aside>

      <main className="flex flex-col">
        <div className="lg:hidden border-b border-border px-6 py-5">
          <Link
            href="/"
            className="font-display text-xl tracking-tight inline-flex items-baseline"
          >
            <span className="italic">F</span>
            <span>estive</span>
          </Link>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </main>
    </div>
  );
}
