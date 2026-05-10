import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border mt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-20">
        <div className="grid gap-16 md:grid-cols-12">
          <div className="md:col-span-5 space-y-6">
            <Wordmark size="lg" />
            <p className="text-sm text-muted-foreground max-w-sm leading-relaxed text-pretty">
              A quieter way to find live events. Built for organisers who care
              about the details and attendees who deserve them.
            </p>
          </div>

          <FooterCol
            className="md:col-span-2"
            title="Browse"
            links={[
              { label: "All events", href: "/" },
              { label: "How it works", href: "/how-it-works" },
              { label: "Sign in", href: "/login" },
              { label: "Join", href: "/register" },
            ]}
          />

          <FooterCol
            className="md:col-span-2"
            title="For organisers"
            links={[
              { label: "Become a host", href: "/register?role=organiser" },
              { label: "Dashboard", href: "/dashboard" },
              { label: "Scanner", href: "/dashboard/scanner" },
              { label: "How it works", href: "/how-it-works" },
            ]}
          />

          <FooterCol
            className="md:col-span-3"
            title="Company"
            links={[
              { label: "About", href: "/how-it-works" },
              { label: "Contact", href: "mailto:hello@festive.dev" },
            ]}
          />
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-6 flex flex-col sm:flex-row gap-2 justify-between text-xs text-muted-foreground">
          <span>© {year} Festive. All rights reserved.</span>
          <span className="font-mono tracking-tight">Made with care, in India.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
  className,
}: {
  title: string;
  links: { label: string; href: string }[];
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground mb-5">
        {title}
      </h3>
      <ul className="space-y-3 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-foreground/85 hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
