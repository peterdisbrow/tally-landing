/**
 * The clock SPA is hosted two ways:
 * - tallyconnect.app/clock (Next rewrite, no prefix)
 * - api.tallyconnect.app/tools/clock/ (Vite base + basename)
 */
export function getRouterBasename(
  pathname: string = typeof window !== "undefined" ? window.location.pathname : "/",
): string | undefined {
  if (pathname === "/tools/clock" || pathname.startsWith("/tools/clock/")) {
    return "/tools/clock";
  }
  return undefined;
}
