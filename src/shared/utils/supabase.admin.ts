import "server-only";

import { createClient } from "@supabase/supabase-js";

import { envServer } from "@/config/env.server";

export const supabaseAdmin = createClient(
  envServer.NEXT_PUBLIC_SUPABASE_URL,
  envServer.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  },
);
