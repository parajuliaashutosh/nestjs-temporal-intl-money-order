import type { AppRequest, AppResponse, NextFn } from '../types/http.types';

export function parseCookieHeader(
  header: string | undefined,
): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!header) return cookies;

  for (const part of header.split(';')) {
    const eq = part.indexOf('=');
    if (eq === -1) continue;

    const name = part.slice(0, eq).trim();
    if (!name || name in cookies) continue;

    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }

    try {
      cookies[name] = decodeURIComponent(value);
    } catch {
      cookies[name] = value;
    }
  }

  return cookies;
}

export function cookieMiddleware(
  req: AppRequest,
  _res: AppResponse,
  next: NextFn,
) {
  req.cookies ??= parseCookieHeader(req.headers.cookie);
  next();
}
