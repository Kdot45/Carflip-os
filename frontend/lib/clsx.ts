type ClassValue = string | number | false | null | undefined;

/** Tiny classnames joiner so we don't need an extra dependency for it. */
export default function clsx(...values: ClassValue[]): string {
  return values.filter(Boolean).join(" ");
}
