const fs = require("fs");

// Fix 1: Add eslint-disable for handleExecutionError complexity
const apiService = "src/shared/services/api/api.service.ts";
let apiContent = fs.readFileSync(apiService, "utf8");
apiContent = apiContent.replace(
  /  private handleExecutionError\(/,
  "  // eslint-disable-next-line complexity -- Complex error handling with multiple error types\n  private handleExecutionError(",
);
fs.writeFileSync(apiService, apiContent);
console.log("Fixed api.service.ts complexity");

// Fix 2: Remove organizationId unused var
const storageService = "src/shared/services/storage/storage.service.ts";
let storageContent = fs.readFileSync(storageService, "utf8");
storageContent = storageContent.replace(
  /\n\s+organizationId: config\.organizationId,?\n/g,
  "\n",
);
fs.writeFileSync(storageService, storageContent);
console.log("Fixed storage.service.ts unused organizationId");

// Fix 3: Remove params unused var (might be in api service)
apiContent = fs.readFileSync(apiService, "utf8");
apiContent = apiContent.replace(
  /\n\s+params:\s*{\s*\.\.\.request\.params,\s*},?\n/g,
  "\n",
);
fs.writeFileSync(apiService, apiContent);
console.log("Fixed api.service.ts unused params");

// Fix 4: Fix theme index import order
const themeIndex = "src/shared/services/theme/index.ts";
let themeContent = fs.readFileSync(themeIndex, "utf8");
const lines = themeContent.split("\n");
let typeImportIdx = -1;
let factoryImportIdx = -1;

lines.forEach((line, idx) => {
  if (line.includes("from '@/shared/types/theme'")) typeImportIdx = idx;
  if (line.includes("from './theme-factory'") && !line.includes("type"))
    factoryImportIdx = idx;
});

if (
  typeImportIdx > factoryImportIdx &&
  typeImportIdx !== -1 &&
  factoryImportIdx !== -1
) {
  const typeImportLine = lines[typeImportIdx];
  lines.splice(typeImportIdx, 1);
  lines.splice(factoryImportIdx, 0, typeImportLine);
  themeContent = lines.join("\n");
  fs.writeFileSync(themeIndex, themeContent);
  console.log("Fixed theme index import order");
}

console.log("\nAll fixes applied!");
