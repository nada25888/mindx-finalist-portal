import { z } from "zod";

/** Converts Arabic-Indic (٠-٩) and Persian (۰-۹) digits to Latin digits and strips spaces/dashes. */
export function normalizeDigits(value: string): string {
  return value
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .replace(/[\s-]/g, "");
}

/** Egyptian mobile: 11 digits, starts with 010 / 011 / 012 / 015. */
export const EGYPT_PHONE_REGEX = /^01[0125]\d{8}$/;
/** National ID: exactly 14 digits. */
export const NATIONAL_ID_REGEX = /^\d{14}$/;

export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".zip"];
export const MAX_FILE_SIZE_MB = 25;

export const submissionSchema = z
  .object({
    participantCode: z
      .string()
      .trim()
      .min(4, "كود المتأهل لازم يكون 4 حروف على الأقل")
      .max(64, "كود المتأهل طويل جدًا"),
    fullName: z
      .string()
      .trim()
      .min(1, "الاسم بالكامل مطلوب")
      .max(120, "الاسم طويل جدًا")
      .refine((v) => v.split(/\s+/).filter(Boolean).length >= 3, "اكتب الاسم ثلاثي على الأقل"),
    phone: z
      .string()
      .transform(normalizeDigits)
      .refine((v) => EGYPT_PHONE_REGEX.test(v), "رقم التليفون لازم يكون 11 رقم ويبدأ بـ 010 أو 011 أو 012 أو 015"),
    nationalId: z
      .string()
      .transform(normalizeDigits)
      .refine((v) => NATIONAL_ID_REGEX.test(v), "الرقم القومي لازم يكون 14 رقم بالظبط"),
    projectLink: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https?:\/\/\S+\.\S+/.test(v), "اكتب رابط صحيح يبدأ بـ https://")
      .optional()
      .default(""),
    hasFile: z.boolean(),
  })
  .refine((d) => d.hasFile || (d.projectLink ?? "") !== "", {
    message: "ارفع ملف PDF أو ZIP أو ضيف رابط المشروع",
    path: ["projectLink"],
  });

export type SubmissionFormValues = z.input<typeof submissionSchema>;

export function validateWorkFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (!ALLOWED_FILE_EXTENSIONS.some((ext) => name.endsWith(ext))) {
    return "الملف لازم يكون PDF أو ZIP";
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `حجم الملف أكبر من ${MAX_FILE_SIZE_MB} ميجا`;
  }
  return null;
}

/** Final judging score: whole or decimal number between 0 and 100. */
export function isValidScore(value: number): boolean {
  return Number.isFinite(value) && value >= 0 && value <= 100;
}
