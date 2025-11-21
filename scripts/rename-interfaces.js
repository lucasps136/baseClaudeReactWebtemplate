/**
 * Script to rename interfaces to add I prefix
 * Uses simple string replacement with careful regex patterns
 */

const fs = require("fs");
const path = require("path");

// Map of old names to new names
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

// Files to process (only shared/types for Batch 1)
const typesDir = path.join(__dirname, "../src/shared/types");
const files = [
  path.join(typesDir, "auth.ts"),
  path.join(typesDir, "database.ts"),
  path.join(typesDir, "payments.ts"),
  path.join(typesDir, "rbac.ts"),
  path.join(typesDir, "theme.ts"),
  path.join(typesDir, "global.ts"),
];

console.log("Starting interface renaming...\n");

files.forEach((filePath) => {
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let changesCount = 0;

  Object.entries(renames).forEach(([oldName, newName]) => {
    // Use word boundary regex to match ONLY our interface names
    // This will match:
    // - interface OldName
    // - : OldName
    // - <OldName>
    // - extends OldName
    // - etc.
    // But NOT: Stripe.OldName, someOldName, OldNameSuffix

    const regex = new RegExp(`\\b${oldName}\\b`, "g");
    const before = content;
    content = content.replace(regex, newName);

    if (before !== content) {
      // Count actual replacements
      const matches = before.match(regex);
      changesCount += matches ? matches.length : 0;
    }
  });

  if (changesCount > 0) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ ${path.basename(filePath)}: ${changesCount} replacements`);
  } else {
    console.log(`⏭️  ${path.basename(filePath)}: no changes`);
  }
});

console.log("\n✨ Done! Run type-check to verify.");
