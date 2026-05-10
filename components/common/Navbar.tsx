"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Wordmark } from "./Wordmark";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/how-it-works", label: "How it works" },
];

export function Navbar() {
  const { user, profile, signOut, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isOrganiser =
    profile?.role === "organiser" || profile?.role === "admin";

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-colors",
        scrolled
          ? "border-b border-border bg-background/85 backdrop-blur-md"
          : "border-b border-transparent bg-background",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
        <Wordmark size="md" />

        <nav className="hidden md:flex items-center gap-9 text-[13px]">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {isOrganiser && (
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Dashboard
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                  <Avatar className="h-9 w-9 border border-border">
                    {profile?.avatar_url && (
                      <AvatarImage src={profile.avatar_url} alt="" />
                    )}
                    <AvatarFallback className="text-[13px] font-medium">
                      {(profile?.full_name || user.email || "?")
                        .slice(0, 1)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="flex flex-col gap-1 normal-case">
                  <span className="text-sm font-medium text-foreground">
                    {profile?.full_name || "Welcome"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {user.email}
                  </span>
                  {isOrganiser && (
                    <span className="mt-1 inline-flex w-fit items-center text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
                      Organiser
                    </span>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/my-tickets">My tickets</Link>
                </DropdownMenuItem>
                {isOrganiser && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={signOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/register">Join</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
