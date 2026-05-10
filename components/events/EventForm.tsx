"use client";

import { useFieldArray, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { createEventSchema, type CreateEventSchema } from "@/lib/validations/event.schema";
import { EVENT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

interface Props {
  initial?: Partial<CreateEventSchema> & { id?: string };
}

export function EventForm({ initial }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<CreateEventSchema>({
    resolver: zodResolver(createEventSchema) as unknown as Resolver<CreateEventSchema>,
    defaultValues: {
      title: initial?.title ?? "",
      description: initial?.description ?? "",
      category: (initial?.category as CreateEventSchema["category"]) ?? "Conference",
      venue: initial?.venue ?? "",
      city: initial?.city ?? "",
      address: initial?.address ?? "",
      event_date: initial?.event_date ?? "",
      end_date: initial?.end_date ?? "",
      banner_url: initial?.banner_url ?? "",
      tags: initial?.tags ?? [],
      ticket_tiers: initial?.ticket_tiers ?? [
        { name: "General", description: "", price: 0, capacity: 100, sort_order: 0 },
      ],
    },
  });

  const tiers = useFieldArray({
    control: form.control,
    name: "ticket_tiers",
  });

  async function onSubmit(values: CreateEventSchema) {
    setSubmitting(true);
    try {
      const url = initial?.id ? `/api/events/${initial.id}` : "/api/events";
      const method = initial?.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      toast.success(initial?.id ? "Event updated" : "Event created");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save event");
    } finally {
      setSubmitting(false);
    }
  }

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basics */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <h2 className="font-display text-2xl">Event details</h2>

          <Field label="Title" error={errors.title?.message}>
            <Input {...form.register("title")} placeholder="TechFest Hyderabad 2025" />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Textarea
              {...form.register("description")}
              rows={6}
              placeholder="Tell attendees what makes this event special…"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category" error={errors.category?.message}>
              <Select
                value={form.watch("category")}
                onValueChange={(v) =>
                  form.setValue("category", v as CreateEventSchema["category"])
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_CATEGORIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Banner URL (optional)" error={errors.banner_url?.message}>
              <Input
                type="url"
                placeholder="https://…"
                {...form.register("banner_url")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Venue" error={errors.venue?.message}>
              <Input {...form.register("venue")} />
            </Field>
            <Field label="City" error={errors.city?.message}>
              <Input {...form.register("city")} />
            </Field>
          </div>

          <Field label="Address (optional)" error={errors.address?.message}>
            <Input {...form.register("address")} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Start" error={errors.event_date?.message}>
              <Input
                type="datetime-local"
                {...form.register("event_date")}
              />
            </Field>
            <Field label="End (optional)" error={errors.end_date?.message}>
              <Input
                type="datetime-local"
                {...form.register("end_date")}
              />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Tiers */}
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Ticket tiers</h2>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                tiers.append({
                  name: "",
                  description: "",
                  price: 0,
                  capacity: 50,
                  sort_order: tiers.fields.length,
                })
              }
              disabled={tiers.fields.length >= 5}
            >
              <Plus className="h-4 w-4" /> Add tier
            </Button>
          </div>

          <div className="space-y-4">
            {tiers.fields.map((field, idx) => {
              const tierErrs = errors.ticket_tiers?.[idx];
              return (
                <div
                  key={field.id}
                  className="rounded-md border border-border p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-muted-foreground">
                      Tier {idx + 1}
                    </span>
                    {tiers.fields.length > 1 && (
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => tiers.remove(idx)}
                        aria-label="Remove tier"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <Field label="Name" error={tierErrs?.name?.message}>
                      <Input
                        placeholder="General / VIP / Student"
                        {...form.register(`ticket_tiers.${idx}.name`)}
                      />
                    </Field>
                    <Field
                      label="Price (₹)"
                      error={tierErrs?.price?.message}
                    >
                      <Input
                        type="number"
                        min={0}
                        step={1}
                        {...form.register(`ticket_tiers.${idx}.price`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                    <Field
                      label="Capacity"
                      error={tierErrs?.capacity?.message}
                    >
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        {...form.register(`ticket_tiers.${idx}.capacity`, {
                          valueAsNumber: true,
                        })}
                      />
                    </Field>
                  </div>

                  <Field
                    label="Description (optional)"
                    error={tierErrs?.description?.message}
                  >
                    <Input
                      placeholder="Includes lunch, swag…"
                      {...form.register(`ticket_tiers.${idx}.description`)}
                    />
                  </Field>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={submitting}>
          {submitting
            ? "Saving…"
            : initial?.id
              ? "Save changes"
              : "Create event"}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}
