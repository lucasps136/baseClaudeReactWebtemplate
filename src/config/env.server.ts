import "server-only";

import { z } from "zod";

const serverSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().min(1, "Supabase URL is required"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "Supabase Anon Key is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "Supabase Service Role Key is required"),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

function validateEnvServer(): z.infer<typeof serverSchema> {
  try {
    return serverSchema.parse(process.env);
  } catch (error) {
    console.error("Server environment validation failed", error);
    if (error instanceof z.ZodError) {
      console.error("Validation errors:", error.errors);
    }
    throw error;
  }
}

export const envServer = validateEnvServer();

export function getEnvServer(): z.infer<typeof serverSchema> {
  return envServer;
}
