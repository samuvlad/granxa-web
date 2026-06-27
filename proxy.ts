import { NextResponse, type NextRequest } from "next/server";

const COOKIE_NAME = "granxa_auth_token";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_PREFIXES = ["/_next", "/api/auth", "/favicon.ico"];

export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (
    PUBLIC_PATHS.includes(pathname) ||
    PUBLIC_PREFIXES.some((p) => pathname.startsWith(p))
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
