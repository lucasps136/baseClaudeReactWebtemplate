import { createClient } from "@supabase/supabase-js";

import { envClient } from "@/config/env.client";

// Anon client — safe on client and server
export const supabase = createClient(
  envClient.NEXT_PUBLIC_SUPABASE_URL,
  envClient.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
