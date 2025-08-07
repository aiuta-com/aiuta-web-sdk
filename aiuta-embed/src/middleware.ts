import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const referer = request.headers.get("referer") || "";

  const pathname = request.nextUrl.pathname;
  const allowedDirectAccessPaths = ["/api/sdk", "/qr"];
  const isQrRoute = pathname.startsWith("/qr");

  if (allowedDirectAccessPaths.includes(pathname) || isQrRoute) {
    return NextResponse.next();
  }

  // If there's no referer, it's probably a direct access
  if (!referer) {
    return new NextResponse("Access denied: not loaded in iframe", {
      status: 403,
    });
  }

  // Optionally allow only if referer is your site
  // if (!referer.startsWith("http://localhost:8080")) {
  //   return new NextResponse("Access denied", { status: 403 });
  // }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};
