import { type ActionFunctionArgs, redirect } from "@remix-run/node";
import { createClient } from "~/utils/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
    const { supabase, headers } = createClient(request);

  await supabase.auth.signOut();

  // merge headers
  headers.forEach((value, key) => {
    response.headers.append(key, value);
  });

  // 登出操作不应该被缓存
  response.headers.set("Cache-Control", "no-cache, no-store, must-revalidate");

  // Redirect to the homepage, ensuring the auth cookie is cleared.
  return redirect("/", {
    headers: response.headers,
  });
};

// This is a resource route, so it doesn't need a default export.
// It only exists to handle the POST request for signing out.
export default function SignOutRoute() {
  return null;
} 