import { useOutletContext } from "@remix-run/react";
import type { SupabaseClient, Session } from "@supabase/supabase-js";
import type { Database } from "~/lib/types";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
  session: Session | null;
};

export const useSupabase = () => {
  const context = useOutletContext<SupabaseContext>();
  if (context === undefined) {
    throw new Error("useSupabase must be used within a Remix Outlet that has a Supabase context.");
  }
  return context;
}; 