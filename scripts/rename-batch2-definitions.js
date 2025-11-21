/**
 * Batch 2: Rename interface DEFINITIONS only (not references)
 * Conservative approach to avoid over-substitution
 */

const fs = require("fs");
const path = require("path");

const renames = {
  // Features - Users (8)
  ErrorProps: "IErrorProps",
  UserState: "IUserState",
  UserActions: "IUserActions",
  UserProfile: "IUserProfile",
  CreateUserInput: "ICreateUserInput",
  UpdateUserInput: "IUpdateUserInput",
  UserListFilter: "IUserListFilter",
  UserListResponse: "IUserListResponse",

  // Providers - Props/Context (12)
  AuthContextType: "IAuthContextType",
  AuthProviderProps: "IAuthProviderProps",
  ProtectedRouteProps: "IProtectedRouteProps",
  DatabaseContextType: "IDatabaseContextType",
  DatabaseProviderProps: "IDatabaseProviderProps",
  DatabaseStatusProps: "IDatabaseStatusProps",
  RBACContextValue: "IRBACContextValue",
  RBACProviderProps: "IRBACProviderProps",
  RBACErrorBoundaryProps: "IRBACErrorBoundaryProps",
  RootProviderProps: "IRootProviderProps",
  ExtendedThemeProviderProps: "IExtendedThemeProviderProps",
  ExtendedThemeProviderInnerProps: "IExtendedThemeProviderInnerProps",

  // Components - Props (8)
  RBACGuardProps: "IRBACGuardProps",
  AdminGuardProps: "IAdminGuardProps",
  OwnerGuardProps: "IOwnerGuardProps",
  SuperAdminGuardProps: "ISuperAdminGuardProps",
  PermissionGateProps: "IPermissionGateProps",
  ResourceGateProps: "IResourceGateProps",
  ButtonProps: "IButtonProps",
  ThemePreviewProps: "IThemePreviewProps",

  // Services - API (7)
  RequestConfig: "IRequestConfig",
  ApiRequest: "IApiRequest",
  ApiErrorResponse: "IApiErrorResponse",
  ResponseInterceptor: "IResponseInterceptor",
  InterceptorConfig: "IInterceptorConfig",
  ApiProviderConfig: "IApiProviderConfig",
  ApiServiceDependencies: "IApiServiceDependencies",

  // Services - Logger (2)
  LogEntry: "ILogEntry",
  LoggerConfig: "ILoggerConfig",

  // Services - Storage (12)
  StorageOptions: "IStorageOptions",
  SecureStorageOptions: "ISecureStorageOptions",
  StorageItem: "IStorageItem",
  SecureStorageItem: "ISecureStorageItem",
  StorageUsage: "IStorageUsage",
  StorageEvent: "IStorageEvent",
  CrossTabMessage: "ICrossTabMessage",
  CleanupStrategy: "ICleanupStrategy",
  StorageProvider: "IStorageProvider",
  EncryptionConfig: "IEncryptionConfig",
  EncryptedData: "IEncryptedData",
  StorageServiceDependencies: "IStorageServiceDependencies",

  // Stores (6)
  AuthActions: "IAuthActions",
  SessionState: "ISessionState",
  SessionActions: "ISessionActions",
  UIState: "IUIState",
  Notification: "INotification",
  UIActions: "IUIActions",
};

function fixInterfaceDefinitions(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  let changed = false;
  const original = content;

  Object.entries(renames).forEach(([oldName, newName]) => {
    // Only match interface DEFINITIONS
    // Pattern: "interface OldName" or "export interface OldName"
    const interfaceDefRegex = new RegExp(
      `((?:^|\\n)(?:export\\s+)?interface\\s+)${oldName}\\b`,
      "gm",
    );

    if (interfaceDefRegex.test(content)) {
      content = content.replace(interfaceDefRegex, `$1${newName}`);
      changed = true;
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, "utf8");
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

console.log("🔧 Batch 2: Renaming interface definitions...\n");

let filesFixed = 0;
const changedFiles = [];

allFiles.forEach((filePath) => {
  if (fixInterfaceDefinitions(filePath)) {
    const relativePath = path.relative(srcDir, filePath);
    console.log(`✅ ${relativePath}`);
    changedFiles.push(relativePath);
    filesFixed++;
  }
});

console.log(`\n✨ Fixed ${filesFixed} files`);
console.log(`📋 Total interfaces: ${Object.keys(renames).length}`);
console.log("🔍 Next: Run type-check to find import/reference errors");
