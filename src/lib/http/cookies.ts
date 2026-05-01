export function getCookieValue(request: Request, name: string): string | undefined {
  const maybeNextRequest = request as Request & {
    cookies?: {
      get: (cookieName: string) => { value: string } | undefined;
    };
  };

  const fromNext = maybeNextRequest.cookies?.get?.(name)?.value;
  if (fromNext) return fromNext;

  const cookieHeader = request.headers.get("cookie");
  if (!cookieHeader) return undefined;

  const parts = cookieHeader.split(";").map((item) => item.trim());
  for (const part of parts) {
    const [key, ...rest] = part.split("=");
    if (key === name) {
      return decodeURIComponent(rest.join("="));
    }
  }
  return undefined;
}
