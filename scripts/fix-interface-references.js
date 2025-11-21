/**
 * Fix interface references - both imports and code usage
 * Surgical approach to avoid over-substitution
 */

const fs = require("fs");
const path = require("path");

const renames = {
  // Auth - All 8 interfaces from auth.ts
  User: "IUser",
  AuthSession: "IAuthSession",
  LoginCredentials: "ILoginCredentials",
  RegisterCredentials: "IRegisterCredentials",
  ResetPasswordData: "IResetPasswordData",
  AuthError: "IAuthError",
  AuthState: "IAuthState",
  AuthProviderConfig: "IAuthProviderConfig",

  // Database - All 15 interfaces from database.ts
  DatabaseRecord: "IDatabaseRecord",
  QueryOptions: "IQueryOptions",
  InsertData: "IInsertData",
  UpdateData: "IUpdateData",
  UpsertData: "IUpsertData",
  DatabaseResponse: "IDatabaseResponse",
  DatabaseError: "IDatabaseError",
  TransactionContext: "ITransactionContext",
  RealtimeSubscription: "IRealtimeSubscription",
  RealtimeEvent: "IRealtimeEvent",
  DatabaseProviderConfig: "IDatabaseProviderConfig",
  SupabaseConfig: "ISupabaseConfig",
  PlanetScaleConfig: "IPlanetScaleConfig",
  PrismaConfig: "IPrismaConfig",
  MongoDBConfig: "IMongoDBConfig",

  // RBAC - All 13 interfaces from rbac.ts
  Role: "IRole",
  Permission: "IPermission",
  UserRole: "IUserRole",
  RolePermission: "IRolePermission",
  AssignRoleOptions: "IAssignRoleOptions",
  RBACProviderConfig: "IRBACProviderConfig",
  RBACClaims: "IRBACClaims",
  RBACResponse: "IRBACResponse",
  RBACError: "IRBACError",
  ResourceAction: "IResourceAction",
  Organization: "IOrganization",
  RBACContext: "IRBACContext",
  UseRBACReturn: "IUseRBACReturn",

  // Theme - All 6 interfaces from theme.ts
  ThemeColors: "IThemeColors",
  ThemeSpacing: "IThemeSpacing",
  CustomTheme: "ICustomTheme",
  ThemeConfig: "IThemeConfig",
  ThemeContextType: "IThemeContextType",
  CreateThemeOptions: "ICreateThemeOptions",

  // Payments - All 13 interfaces from payments.ts
  Price: "IPrice",
  Product: "IProduct",
  Subscription: "ISubscription",
  Customer: "ICustomer",
  PaymentIntent: "IPaymentIntent",
  CheckoutSession: "ICheckoutSession",
  WebhookEvent: "IWebhookEvent",
  CreateSubscriptionOptions: "ICreateSubscriptionOptions",
  CreateCheckoutSessionOptions: "ICreateCheckoutSessionOptions",
  CreatePaymentIntentOptions: "ICreatePaymentIntentOptions",
  PaymentProviderConfig: "IPaymentProviderConfig",
  PaymentError: "IPaymentError",
  PaymentResponse: "IPaymentResponse",

  // Global - All 12 interfaces from global.ts
  ApiResponse: "IApiResponse",
  PaginatedResponse: "IPaginatedResponse",
  BaseEntity: "IBaseEntity",
  SelectOption: "ISelectOption",
  NavItem: "INavItem",
  SiteConfig: "ISiteConfig",
  FeatureFlag: "IFeatureFlag",
  BaseComponentProps: "IBaseComponentProps",
  WithLoading: "IWithLoading",
  WithError: "IWithError",
  FormFieldError: "IFormFieldError",
  FormState: "IFormState",
};

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  const original = content;

  Object.entries(renames).forEach(([oldName, newName]) => {
    // Pattern 1: Import statements
    // import type { ..., AuthProviderConfig, ... } from '@/shared/types/...'
    const importRegex = new RegExp(
      `(import\\s+(?:type\\s+)?{[^}]*?)\\b${oldName}\\b([^}]*}\\s+from\\s+["']@/shared/types/)`,
      "g",
    );
    content = content.replace(importRegex, `$1${newName}$2`);

    // Pattern 2: Type annotations
    // config?: AuthProviderConfig
    // useState<AuthState>
    // : AuthState
    const typeAnnotationRegex = new RegExp(
      `([:\\?<,\\s])${oldName}\\b(?![A-Z])`,
      "g",
    );
    content = content.replace(typeAnnotationRegex, `$1${newName}`);
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    changed = true;
  }

  return changed;
}

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      if (!["node_modules", "dist", ".next", "build"].includes(file)) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx)$/)) {
      fileList.push(filePath);
    }
  });

  return fileList;
}

const srcDir = path.join(__dirname, "../src");
const allFiles = getAllTsFiles(srcDir);

console.log("🔧 Fixing interface references...\n");

let filesFixed = 0;

allFiles.forEach((filePath) => {
  if (fixFile(filePath)) {
    const relativePath = path.relative(srcDir, filePath);
    console.log(`✅ ${relativePath}`);
    filesFixed++;
  }
});

console.log(`\n✨ Fixed ${filesFixed} files`);
console.log("🔍 Run type-check to verify");
