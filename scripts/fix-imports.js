/**
 * Fix imports to use renamed interfaces with I prefix
 * Only updates import statements, not code references
 */

const fs = require("fs");
const path = require("path");

const renames = {
  // Auth
  User: "IUser",
  AuthSession: "IAuthSession",
  LoginCredentials: "ILoginCredentials",
  RegisterCredentials: "IRegisterCredentials",
  ResetPasswordData: "IResetPasswordData",
  AuthError: "IAuthError",
  AuthState: "IAuthState",
  AuthProviderConfig: "IAuthProviderConfig",

  // Database
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

  // Payments
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

  // RBAC
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

  // Theme
  ThemeColors: "IThemeColors",
  ThemeSpacing: "IThemeSpacing",
  CustomTheme: "ICustomTheme",
  ThemeConfig: "IThemeConfig",
  ThemeContextType: "IThemeContextType",
  CreateThemeOptions: "ICreateThemeOptions",

  // Global
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

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;

  // Find all import statements from @/shared/types
  const importRegex =
    /import\s+(?:type\s+)?{([^}]+)}\s+from\s+["']@\/shared\/types\/\w+["'];?/g;

  content = content.replace(importRegex, (match) => {
    let updated = match;

    Object.entries(renames).forEach(([oldName, newName]) => {
      // Match the old name as a whole word in the import
      const nameRegex = new RegExp(`\\b${oldName}\\b`, "g");
      if (nameRegex.test(updated)) {
        updated = updated.replace(nameRegex, newName);
        changed = true;
      }
    });

    return updated;
  });

  if (changed) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }

  return false;
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

console.log("🔍 Fixing imports in TypeScript files...\n");

let filesFixed = 0;

allFiles.forEach((filePath) => {
  if (fixImportsInFile(filePath)) {
    const relativePath = path.relative(srcDir, filePath);
    console.log(`✅ ${relativePath}`);
    filesFixed++;
  }
});

console.log(`\n✨ Fixed ${filesFixed} files`);
console.log("🔍 Run type-check to verify");
