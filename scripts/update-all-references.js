/**
 * Update all references to renamed interfaces across entire src/
 */

const fs = require("fs");
const path = require("path");

// Same renames map
const renames = {
  // Auth types
  User: "IUser",
  AuthSession: "IAuthSession",
  LoginCredentials: "ILoginCredentials",
  RegisterCredentials: "IRegisterCredentials",
  ResetPasswordData: "IResetPasswordData",
  AuthError: "IAuthError",
  AuthState: "IAuthState",
  AuthProviderConfig: "IAuthProviderConfig",

  // Database types
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

  // Payment types
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

  // RBAC types
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

  // Theme types
  ThemeColors: "IThemeColors",
  ThemeSpacing: "IThemeSpacing",
  CustomTheme: "ICustomTheme",
  ThemeConfig: "IThemeConfig",
  ThemeContextType: "IThemeContextType",
  CreateThemeOptions: "ICreateThemeOptions",

  // Global types
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

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules, dist, etc.
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

console.log(`Found ${allFiles.length} TypeScript files\n`);

let totalChanges = 0;
let filesChanged = 0;

allFiles.forEach((filePath) => {
  let content = fs.readFileSync(filePath, "utf8");
  let changesCount = 0;
  const original = content;

  Object.entries(renames).forEach(([oldName, newName]) => {
    const regex = new RegExp(`\b${oldName}\b`, "g");
    const before = content;
    content = content.replace(regex, newName);

    if (before !== content) {
      const matches = before.match(regex);
      changesCount += matches ? matches.length : 0;
    }
  });

  if (changesCount > 0 && content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
    const relativePath = path.relative(srcDir, filePath);
    console.log(`✅ ${relativePath}: ${changesCount} replacements`);
    totalChanges += changesCount;
    filesChanged++;
  }
});

console.log(
  `\n✨ Done! Updated ${filesChanged} files with ${totalChanges} total replacements`,
);
console.log("🔍 Run type-check to verify");
