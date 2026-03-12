import { NextRequest, NextResponse } from "next/server";

// Routes that don't require authentication
const publicPaths = [
  "/",
  "/sign-in",
  "/sign-up",
];

function isPublicPath(pathname: string): boolean {
  return publicPaths.some(
    (path) => pathname === path || pathname.startsWith(path + "/")
  );
}

/** Lightweight JWT expiry check (no signature verification — done server-side) */
function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64").toString()
    );
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let public routes through unconditionally
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Read access token from cookie (set by our AuthContext after login)
  const accessToken = req.cookies.get("accessToken")?.value;

  if (!accessToken || isTokenExpired(accessToken)) {
    // Redirect unauthenticated users to sign-in
    const signInUrl = req.nextUrl.clone();
    signInUrl.pathname = "/sign-in";
    signInUrl.searchParams.set("redirect_url", pathname);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
