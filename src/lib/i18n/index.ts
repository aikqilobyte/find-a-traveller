import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  dictionaries,
  type Dictionary,
  type Locale,
} from "@/lib/i18n/dictionaries";

export const LOCALE_COOKIE = "fat_locale";

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Reads the visitor's language choice. Server Components only. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}

export type { Dictionary, Locale };
