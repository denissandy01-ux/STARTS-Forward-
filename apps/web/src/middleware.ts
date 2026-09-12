import { NextRequest, NextResponse } from "next/server";
import { authConfiguration } from "./lib/auth-config";
import { getAuth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const config = authConfiguration();
  if (pathname === "/login") return NextResponse.next();
  if (!config.enabled) {
    if (pathname.startsWith("/auth/")) return NextResponse.redirect(new URL("/login", request.url));
    return NextResponse.next();
  }
  if (!config.ready) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Login configuration is incomplete." }, { status: 503 });
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const auth0 = getAuth0();
  const response = await auth0.middleware(request);
  if (pathname.startsWith("/auth/")) return response;
  const session = await auth0.getSession(request);
  if (!session?.user?.sub) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method) && request.headers.get("origin") !== new URL(process.env.APP_BASE_URL!).origin) {
    return NextResponse.json({ error: "Use this application's own page." }, { status: 403 });
  }
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}
export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|images/).*)"] };
