/**
 * Converts a string to kebab-case.
 * Example: "Hello World" -> "hello-world"
 */
function toKebabCase(str: string): string {
  return str
    .trim()
    .replace(/([a-z])([A-Z])/g, '$1-$2') // handle camelCase
    .replace(/\s+/g, '-')                // replace spaces with -
    .replace(/_+/g, '-')                 // replace underscores with -
    .toLowerCase();
}


async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


export const UTIL_FUNCTIONS = {
  toKebabCase,
  delay,
};