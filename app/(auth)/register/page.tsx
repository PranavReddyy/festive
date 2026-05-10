"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  registerSchema,
  type RegisterSchema,
} from "@/lib/validations/auth.schema";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || "/";
  const [busy, setBusy] = useState(false);

  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      full_name: "",
      role: "attendee",
      organiser_name: "",
    },
  });

  const role = form.watch("role");

  async function onSubmit(values: RegisterSchema) {
    setBusy(true);
    const supabase = getSupabaseBrowser();
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: {
          full_name: values.full_name,
          role: values.role,
          organiser_name: values.organiser_name || null,
        },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Account created — you're signed in");
    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <p className="text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          Join Festive
        </p>
        <h1 className="font-display text-4xl tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Already have one?{" "}
          <Link
            href={`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-2 gap-2">
          {(["attendee", "organiser"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => form.setValue("role", r)}
              className={cn(
                "rounded-md border p-3.5 text-left transition-colors",
                role === r
                  ? "border-foreground bg-muted/40"
                  : "border-border bg-card hover:border-foreground/40",
              )}
            >
              <p className="font-medium capitalize text-[13px] text-foreground">
                {r}
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                {r === "attendee"
                  ? "Discover & book events"
                  : "Host & sell tickets"}
              </p>
            </button>
          ))}
        </div>

        <div>
          <Label className="mb-1.5 block text-[12px] font-medium text-foreground/80">
            Full name
          </Label>
          <Input autoComplete="name" {...form.register("full_name")} />
          {form.formState.errors.full_name && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.full_name.message}
            </p>
          )}
        </div>

        {role === "organiser" && (
          <div>
            <Label className="mb-1.5 block text-[12px] font-medium text-foreground/80">
              Organisation name
            </Label>
            <Input {...form.register("organiser_name")} />
            {form.formState.errors.organiser_name && (
              <p className="mt-1 text-xs text-destructive">
                {form.formState.errors.organiser_name.message}
              </p>
            )}
          </div>
        )}

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
            autoComplete="new-password"
            {...form.register("password")}
          />
          {form.formState.errors.password && (
            <p className="mt-1 text-xs text-destructive">
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={busy}>
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>
    </div>
  );
}
