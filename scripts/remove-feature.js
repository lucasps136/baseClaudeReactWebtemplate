#!/usr/bin/env node

/**
 * remove-feature.js
 *
 * TODO: Implementação futura — Remoção completa de feature
 *
 * Este comando está planejado mas ainda não implementado.
 * Quando implementado, deverá:
 *
 * TODO 1: Remover pasta da feature
 *   - Alvo: src/features/[nome]/
 *   - Ação: fs.rmSync(featurePath, { recursive: true })
 *   - Verificar: garantir que nenhum outro arquivo importa da feature antes de remover
 *
 * TODO 2: Remover rota do App Router
 *   - Alvo: src/app/[nome]/page.tsx (e a pasta, se vazia)
 *   - Ação: fs.rmSync(appRoutePath, { recursive: true })
 *   - Verificar: confirmar que a pasta existe antes de remover
 *
 * TODO 3: Remover entrada de routes.ts (objeto)
 *   - Alvo: src/config/routes.ts — linha `[nome]: "/[nome]",`
 *   - Ação: regex replace para remover a linha específica no bloco correspondente
 *
 * TODO 4: Remover entrada de routes.ts (array)
 *   - Alvo: src/config/routes.ts — item `"/nome",` no array routeGroups.protected
 *   - Ação: regex replace para remover a string do array
 *   - Verificar: fazer backup ou usar confirmação interativa antes
 *
 * IMPORTANTE: Sempre solicitar confirmação explícita antes de qualquer deleção.
 * IMPORTANTE: Executar `npm run build` após remoção para verificar ausência de referências quebradas.
 */

const featureName = process.argv[2];

if (!featureName) {
  console.error("❌ Forneça o nome da feature: npm run remove:feature <nome>");
  process.exit(1);
}

console.log(`\n⚠️  remove:feature ainda não está implementado.`);
console.log(`\nPara remover a feature '${featureName}' manualmente:`);
console.log(`  1. Apagar pasta:  src/features/${featureName}/`);
console.log(`  2. Apagar rota:   src/app/${featureName}/`);
console.log(
  `  3. Remover linha: '${featureName}: "/${featureName}"' do objeto em src/config/routes.ts`,
);
console.log(
  `  4. Remover string: '"/${featureName}"' do array routeGroups.protected em src/config/routes.ts se aplicável`,
);
console.log(`  5. Verificar:     npm run build`);
console.log(
  `\nConsulte os TODO em scripts/remove-feature.js para o escopo da implementação futura.\n`,
);
process.exit(1);
