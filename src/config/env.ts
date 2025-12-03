import { z } from "zod";

const envSchema = z.object({
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
  STRIPE_SECRET_KEY: z.string().min(1, "Stripe Secret Key is required"),
  STRIPE_WEBHOOK_SECRET: z.string().min(1, "Stripe Webhook Secret is required"),
});

function validateEnv(): z.infer<typeof envSchema> {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    console.error("Environment validation failed");
    throw error;
  }
}

export const env = validateEnv();

// Helper function for accessing env variables (without parameters - returns all env)
export function getEnv(): z.infer<typeof envSchema> {
  return env;
}
