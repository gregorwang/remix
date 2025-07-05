import { redirect } from "@remix-run/node";
import { createSupabaseServerClient } from "./supabase.server";

/**
 * A server-side utility to require a user session.
 * If no session is found, it throws a redirect to the /auth page.
 * @param request The request object from the loader.
 * @returns {Promise<{ session: Session; user: User; supabase: SupabaseClient }>}
 * @throws {Response} A redirect response if the user is not authenticated.
 */
export const requireUser = async (request: Request) => {
  const response = new Response();
  const { supabase, headers } = createSupabaseServerClient({ request, response });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    // If there is no user session, redirect to the auth page.
    throw redirect("/auth");
  }

  return { session, user: session.user, supabase, headers };
}; 