import { z } from "zod";

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Name too short").max(80),
    email: z.string().email(),
    password: z
      .string()
      .min(8, "At least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Must include uppercase, lowercase, and a number",
      ),
    role: z.enum(["attendee", "organiser"]),
    organiser_name: z.string().min(2).max(80).optional().or(z.literal("")),
  })
  .refine(
    (data) =>
      data.role !== "organiser" ||
      (data.organiser_name && data.organiser_name.length >= 2),
    { message: "Organiser display name required", path: ["organiser_name"] },
  );

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterSchema = RegisterInput;
export type LoginSchema = LoginInput;
