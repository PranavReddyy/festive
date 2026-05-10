"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { loginSchema, type LoginSchema } from "@/lib/validations/auth.schema";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [busy, setBusy] = useState(false);

  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginSchema) {
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signInWithPassword(values);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Welcome back");
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Welcome back
        </p>
        <h1 className="font-display text-4xl tracking-tight">Sign in</h1>
        <p className="text-sm text-muted-foreground">
          New here?{" "}
          <Link
            href={`/register${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <Label className="mb-1.5 block text-[12px] font-medium text-foreground/80">
            Email
          </Label>
          <Input
            type="email"
            autoComplete="email"
            {...form.register("email")}
          />
          {form.formState.errors.email && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.email.message}
            </p>
          )}
        </div>
        <div>
          <Label className="mb-1.5 block text-[12px] font-medium text-foreground/80">
            Password
          </Label>
          <Input
            type="password"
            autoComplete="current-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
