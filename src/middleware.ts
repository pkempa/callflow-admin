import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/analytics",
  "/users",
  "/platform-users",
  "/plans",
  "/settings",
  "/profile",
  "/debug",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (isProtectedRoute(req)) {
    // This will redirect to sign-in if user is not authenticated
    await auth.protect();

    // Add user ID to request headers for backend synchronization
    if (userId) {
      req.headers.set("X-Clerk-User-Id", userId);
    }
  }
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
