/**
 * Drop-in replacement for Clerk's useAuth() + useUser() hooks.
 *
 * Usage (same as before):
 *   const { getToken, isSignedIn } = useAuth();
 *   const { user } = useUser();
 *
 * Also exposes login / register / logout for auth pages.
 */
export { useAuthContext as useAuth } from "@/contexts/AuthContext";

// Alias `useUser` to return { user, isSignedIn } — matches Clerk's shape
import { useAuthContext } from "@/contexts/AuthContext";

export function useUser() {
  const { user, isSignedIn, isLoading } = useAuthContext();
  return { user, isSignedIn, isLoaded: !isLoading };
}
