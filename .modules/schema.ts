import { z } from "zod";

/**
 * Categoria de módulos
 */
export const ModuleCategorySchema = z.enum([
  "ui",
  "logic",
  "data",
  "integration",
]);
export type ModuleCategory = z.infer<typeof ModuleCategorySchema>;

/**
 * Status do módulo
 */
export const ModuleStatusSchema = z.enum([
  "experimental",
  "stable",
  "deprecated",
]);
export type ModuleStatus = z.infer<typeof ModuleStatusSchema>;

/**
 * Tipo de arquivo relacionado
 */
export const FileTypeSchema = z.enum([
  "TO_MODIFY",
  "REFERENCE",
  "CREATE",
  "DEPENDENCY",
  "OTHER",
]);
export type FileType = z.infer<typeof FileTypeSchema>;

/**
 * Arquivo relacionado ao módulo
 */
export const RelatedFileSchema = z.object({
  path: z.string().min(1),
  type: FileTypeSchema,
  description: z.string().optional(),
  lineStart: z.number().int().positive().optional(),
  lineEnd: z.number().int().positive().optional(),
});
export type RelatedFile = z.infer<typeof RelatedFileSchema>;

/**
 * Informação de export (component, hook, service, etc)
 */
export const ExportInfoSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  type: z.string().optional(),
  description: z.string().optional(),
  props: z.record(z.any()).optional(),
  example: z.string().optional(),
});
export type ExportInfo = z.infer<typeof ExportInfoSchema>;

/**
 * Exports do módulo organizados por tipo
 */
export const ModuleExportsSchema = z.object({
  components: z.array(ExportInfoSchema).optional().default([]),
  hooks: z.array(ExportInfoSchema).optional().default([]),
  services: z.array(ExportInfoSchema).optional().default([]),
  types: z.array(ExportInfoSchema).optional().default([]),
  utils: z.array(ExportInfoSchema).optional().default([]),
  schemas: z.array(ExportInfoSchema).optional().default([]),
  stores: z.array(ExportInfoSchema).optional().default([]),
});
export type ModuleExports = z.infer<typeof ModuleExportsSchema>;

/**
 * Dependências do módulo
 */
export const ModuleDependenciesSchema = z.object({
  modules: z.array(z.string()).optional().default([]),
  packages: z.array(z.string()).optional().default([]),
});
export type ModuleDependencies = z.infer<typeof ModuleDependenciesSchema>;

/**
 * Metadata para IA descobrir e reutilizar módulos
 */
export const AIMetadataSchema = z.object({
  summary: z.string().min(10),
  keywords: z.array(z.string()).min(1),
  use_cases: z.array(z.string()).optional().default([]),
  reusable: z
    .object({
      components: z.array(z.string()).optional().default([]),
      hooks: z.array(z.string()).optional().default([]),
      services: z.array(z.string()).optional().default([]),
      types: z.array(z.string()).optional().default([]),
    })
    .optional()
    .default({}),
  examples: z.array(z.string()).optional().default([]),
});
export type AIMetadata = z.infer<typeof AIMetadataSchema>;

/**
 * Schema completo do manifest de módulo (module.json)
 */
export const ModuleManifestSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  category: ModuleCategorySchema,
  description: z.string().min(10),
  exports: ModuleExportsSchema.optional().default({}),
  dependencies: ModuleDependenciesSchema.optional().default({
    modules: [],
    packages: [],
  }),
  ai: AIMetadataSchema,
  status: ModuleStatusSchema.default("stable"),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  author: z.string().optional(),
  repository: z.string().url().optional(),
  license: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  relatedFiles: z.array(RelatedFileSchema).optional().default([]),
});
export type ModuleManifest = z.infer<typeof ModuleManifestSchema>;

/**
 * Entry no registry para um módulo
 */
export const RegistryEntrySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  version: z.string(),
  category: ModuleCategorySchema,
  path: z.string(),
  description: z.string(),
  keywords: z.array(z.string()),
  status: ModuleStatusSchema,
  updatedAt: z.string().datetime(),
  reusableCount: z.number().int().nonnegative().optional().default(0),
});
export type RegistryEntry = z.infer<typeof RegistryEntrySchema>;

/**
 * Estatísticas do registry
 */
export const RegistryStatsSchema = z.object({
  total_modules: z.number().int().nonnegative(),
  ui: z.number().int().nonnegative(),
  logic: z.number().int().nonnegative(),
  data: z.number().int().nonnegative(),
  integration: z.number().int().nonnegative(),
  reusability_score: z.number().min(0).max(100).optional(),
  last_sync: z.string().datetime().optional(),
});
export type RegistryStats = z.infer<typeof RegistryStatsSchema>;

/**
 * Registry completo de módulos
 */
export const ModuleRegistrySchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  updated: z.string().datetime(),
  categories: z.object({
    ui: z.array(RegistryEntrySchema),
    logic: z.array(RegistryEntrySchema),
    data: z.array(RegistryEntrySchema),
    integration: z.array(RegistryEntrySchema),
  }),
  stats: RegistryStatsSchema,
});
export type ModuleRegistry = z.infer<typeof ModuleRegistrySchema>;

/**
 * Módulo instalado localmente
 */
export const InstalledModuleSchema = z.object({
  id: z.string().min(1),
  version: z.string(),
  installedAt: z.string().datetime(),
  path: z.string(),
  active: z.boolean().default(true),
});
export type InstalledModule = z.infer<typeof InstalledModuleSchema>;

/**
 * Lista de módulos instalados
 */
export const InstalledModulesSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  updated: z.string().datetime(),
  modules: z.array(InstalledModuleSchema),
});
export type InstalledModules = z.infer<typeof InstalledModulesSchema>;

/**
 * Validação de manifest de módulo
 */
export function validateModuleManifest(data: unknown): {
  success: boolean;
  data?: ModuleManifest;
  errors?: z.ZodError;
} {
  const result = ModuleManifestSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Validação de registry
 */
export function validateRegistry(data: unknown): {
  success: boolean;
  data?: ModuleRegistry;
  errors?: z.ZodError;
} {
  const result = ModuleRegistrySchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Validação de lista de instalados
 */
export function validateInstalledModules(data: unknown): {
  success: boolean;
  data?: InstalledModules;
  errors?: z.ZodError;
} {
  const result = InstalledModulesSchema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}
