// Service setup and initialization
// This file configures all services following Dependency Inversion

import { getEnv } from "@/config/env";

import { createApiService } from "./api";
import { createStorageService } from "./storage";

import {
  registerSingleton,
  SERVICE_KEYS,
  resolveService,
  createSupabaseService,
  createValidationService,
  type ISupabaseConfig,
} from "./index";
import type { ISupabaseService, IValidationService } from "./index";

// Setup services with proper dependency injection
export const setupServices = (): void => {
  const env = getEnv();

  // Supabase configuration from environment
  const supabaseConfig: ISupabaseConfig = {
    url: env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
  };

  // Register services as singletons
  registerSingleton(SERVICE_KEYS.SUPABASE, () =>
    createSupabaseService(supabaseConfig),
  );
  registerSingleton(SERVICE_KEYS.VALIDATION, () => createValidationService());

  // Register ApiService with dependencies
  registerSingleton(SERVICE_KEYS.API, () => {
    const supabaseService = resolveService<ISupabaseService>(
      SERVICE_KEYS.SUPABASE,
    );
    const validationService = resolveService<IValidationService>(
      SERVICE_KEYS.VALIDATION,
    );
    return createApiService(supabaseService, validationService);
  });

  // Register StorageService with dependencies
  registerSingleton(SERVICE_KEYS.STORAGE, () => {
    const supabaseService = resolveService<ISupabaseService>(
      SERVICE_KEYS.SUPABASE,
    );
    return createStorageService(supabaseService);
  });

  console.log("✅ Services initialized successfully");
};

// Call this during app initialization
export const initializeServices = (): void => {
  try {
    setupServices();
  } catch (error) {
    console.error("❌ Failed to initialize services:", error);
    throw error;
  }
};
