// Route CLI Utilities
// Shared functions for route generation and injection
// Used by generate-feature.js and generate-module.js

const fs = require("fs");
const path = require("path");

/**
 * T005 + T005b: Generate an App Router page.tsx for a route.
 *
 * @param {string} routePath - Path under src/app/ (e.g. "automacoes" or "modules/teste-ui")
 * @param {string} importPath - Import alias (e.g. "@/features/automacoes")
 * @param {string} componentName - Named export to import (e.g. "AutomacoesList")
 * @param {string} pageName - Default export function name (e.g. "AutomacoesPage")
 * @returns {{ conflict: boolean, pageFile: string }}
 */
function generateAppRoute(routePath, importPath, componentName, pageName) {
  const appDir = path.join("src", "app", routePath);
  const pageFile = path.join(appDir, "page.tsx");

  // Detect conflict — do not overwrite existing page
  if (fs.existsSync(pageFile)) {
    return { conflict: true, pageFile };
  }

  // T005b: Check if the imported component actually exists
  const resolvedImport = importPath.replace("@/", "src/");
  const expectedPath = path.join(process.cwd(), resolvedImport);
  const componentExists =
    fs.existsSync(expectedPath + ".tsx") ||
    fs.existsSync(path.join(expectedPath, "index.ts")) ||
    fs.existsSync(expectedPath);

  fs.mkdirSync(appDir, { recursive: true });

  const pendingComment = componentExists
    ? ""
    : "// TODO: O componente importado abaixo ainda não foi criado.\n";
  const content = `${pendingComment}import { ${componentName} } from '${importPath}'

export default function ${pageName}() {
  return (
    <main className="container mx-auto py-8">
      <${componentName} />
    </main>
  )
}
`;
  fs.writeFileSync(pageFile, content);
  return { conflict: false, pageFile };
}

/**
 * T006: Inject a route entry into src/config/routes.ts.
 *
 * @param {string} routeKey - TypeScript identifier (e.g. "automacoes", "testeUi")
 * @param {string} routePathUrl - Full URL path (e.g. "/automacoes", "/modules/teste-ui")
 * @param {boolean} isProtected - If true, inject into protected block + routeGroups.protected array
 * @returns {boolean} - true if injection succeeded or route already exists
 */
function injectRouteConfig(routeKey, routePathUrl, isProtected) {
  const routesPath = path.join("src", "config", "routes.ts");

  if (!fs.existsSync(routesPath)) {
    console.warn(
      "⚠️  src/config/routes.ts não encontrado. Adicione manualmente.",
    );
    return false;
  }

  let content = fs.readFileSync(routesPath, "utf8");

  // Idempotency: check if route already exists
  if (content.includes(`${routeKey}:`)) {
    console.log(`ℹ️  Rota '${routeKey}' já existe em routes.ts`);
    return true;
  }

  const injection = `    ${routeKey}: "${routePathUrl}",\n`;

  if (isProtected) {
    // Inject into the protected object in `routes`
    const protectedObjRegex = /(  protected: \{)\n/;
    // Inject into the protected array in `routeGroups`
    const protectedArrayRegex = /(  protected: \[)\n/;
    const arrayInjection = `    "${routePathUrl}",\n`;

    if (protectedObjRegex.test(content) && protectedArrayRegex.test(content)) {
      content = content.replace(protectedObjRegex, `$1\n${injection}`);
      content = content.replace(protectedArrayRegex, `$1\n${arrayInjection}`);
    } else {
      console.warn(
        "⚠️  Padrão esperado não encontrado para rotas protegidas. Adicione manualmente:",
      );
      console.warn(`    ${routeKey}: "${routePathUrl}",`);
      return false;
    }
  } else {
    // Inject into the public object in `routes`
    const publicObjRegex = /(  public: \{)\n/;

    if (publicObjRegex.test(content)) {
      content = content.replace(publicObjRegex, `$1\n${injection}`);
    } else {
      console.warn(
        "⚠️  Padrão esperado não encontrado para rotas públicas. Adicione manualmente:",
      );
      console.warn(`    ${routeKey}: "${routePathUrl}",`);
      return false;
    }
  }

  fs.writeFileSync(routesPath, content);
  return true;
}

/**
 * T007a: Ask a yes/no question interactively.
 * In CI mode (isTTY is falsy), returns Promise<false> without prompting.
 *
 * @param {string} question - The prompt to display
 * @returns {Promise<boolean>} - true if user answered 's', false otherwise
 */
function askQuestion(question) {
  // CI / non-interactive mode: skip prompt
  if (!process.stdin.isTTY) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    const rl = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === "s");
    });
  });
}

// T007b: Export all functions
module.exports = {
  generateAppRoute,
  injectRouteConfig,
  askQuestion,
};
