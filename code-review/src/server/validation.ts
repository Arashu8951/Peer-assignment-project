import { z } from "zod";

export type FormState = { error?: string; fieldErrors?: Record<string, string[] | undefined> } | undefined;

export const LANGUAGES = ["JavaScript", "TypeScript", "Python", "Java", "C", "C++", "Go", "Other"] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(60),
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(8, "Use at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email("Enter a valid email")),
  password: z.string().min(1, "Enter your password"),
});

export const submissionSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  language: z.enum(LANGUAGES, "Pick a language"),
  description: z.string().trim().min(10, "Describe what the code does").max(2000),
  code: z
    .string()
    .max(50_000, "Code is too long")
    .refine((c) => c.trim().length > 0, "Paste your code"),
});
export type SubmissionInput = z.infer<typeof submissionSchema>;

const score = z.coerce.number("Pick a score").int().min(1, "Pick a score").max(5);

export const reviewSchema = z.object({
  verdict: z.enum(["APPROVE", "REQUEST_CHANGES"], "Choose a verdict"),
  summary: z.string().trim().min(10, "Write at least a sentence").max(4000),
  correctness: score,
  readability: score,
  structure: score,
  comments: z
    .array(
      z.object({
        lineNumber: z.number().int().min(1),
        body: z.string().trim().min(1).max(1000),
      }),
    )
    .max(200),
});
export type ReviewInput = z.infer<typeof reviewSchema>;
