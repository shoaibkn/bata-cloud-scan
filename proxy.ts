import { NextResponse, type NextRequest } from "next/server";

import { extractTenantSlugFromHost, isReservedHost } from "@/lib/domains";

function shouldBypass(pathname: string) {
  return (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/_sites") ||
    pathname.includes(".")
  );
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (shouldBypass(pathname)) {
    return NextResponse.next();
  }

  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";

  if (isReservedHost(host)) {
    return NextResponse.next();
  }

  const slug = extractTenantSlugFromHost(host);

  if (!slug) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = `/_sites/${slug}${pathname === "/" ? "" : pathname}`;

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)"],
};
