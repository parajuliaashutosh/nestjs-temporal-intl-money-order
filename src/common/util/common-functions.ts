/**
 * Converts a string to kebab-case.
 * Example: "Hello World" -> "hello-world"
 */
export function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2') // handle camelCase
    .replace(/\s+/g, '-')                // replace spaces with -
    .replace(/_+/g, '-')                 // replace underscores with -
    .toLowerCase();
}

export const UTIL_FUNCTIONS = {
  toKebabCase,
};