import { createServerClient, serialize, parse } from "@supabase/ssr";
import type { Database } from "~/lib/types";

export function createClient(request: Request) {
  const cookies = parse(request.headers.get("Cookie") ?? "");
  const headers = new Headers();

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error(
      `Missing required environment variables:\n` +
      `SUPABASE_URL: ${supabaseUrl ? '✓' : '✗ Missing'}\n` +
      `SUPABASE_ANON_KEY: ${supabaseKey ? '✓' : '✗ Missing'}\n` +
      `Please create a .env file in your project root with these variables.`
    );
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        get: (key: string) => cookies[key],
        set: (key: string, value: string, options) => {
          headers.append("Set-Cookie", serialize(key, value, options));
        },
        remove: (key: string, options) => {
          headers.append("Set-Cookie", serialize(key, "", options));
        },
      },
    }
  );

  return { supabase, headers };
} 