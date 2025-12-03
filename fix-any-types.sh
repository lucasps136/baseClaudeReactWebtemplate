#!/bin/bash

# Script para substituir 'any' por tipos apropriados

# 1. Substituir Record<string, any> por Record<string, unknown>
find src/shared -name "*.ts" -type f -exec sed -i 's/Record<string, any>/Record<string, unknown>/g' {} +

# 2. Substituir (error: any) por (error: unknown)
find src/shared -name "*.ts" -type f -exec sed -i 's/(error: any)/(error: unknown)/g' {} +
find src/shared -name "*.ts" -type f -exec sed -i 's/mapError: (error: any)/mapError: (error: unknown)/g' {} +

# 3. Substituir <T = any> por <T = unknown>
find src/shared -name "*.ts" -type f -exec sed -i 's/<T = any>/<T = unknown>/g' {} +

# 4. Substituir value: any por value: unknown (para operações de database)
find src/shared/services/database -name "*.ts" -type f -exec sed -i 's/value: any,/value: unknown,/g' {} +

# 5. Substituir params: any[] por params: unknown[]
find src/shared -name "*.ts" -type f -exec sed -i 's/params: any\[\]/params: unknown[]/g' {} +
find src/shared -name "*.ts" -type f -exec sed -i 's/_params: any\[\]/_params: unknown[]/g' {} +

# 6. Substituir Map<string, any> por Map<string, unknown>
find src/shared -name "*.ts" -type f -exec sed -i 's/Map<string, any>/Map<string, unknown>/g' {} +

# 7. Substituir getClient(): any por getClient(): unknown
find src/shared -name "*.ts" -type f -exec sed -i 's/getClient(): any/getClient(): unknown/g' {} +

# 8. Substituir metadata?: Record<string, any> nos types
find src/shared/types -name "*.ts" -type f -exec sed -i 's/metadata?: Record<string, any>/metadata?: Record<string, unknown>/g' {} +

# 9. Substituir details?: any por details?: unknown
find src/shared -name "*.ts" -type f -exec sed -i 's/details?: any/details?: unknown/g' {} +

# 10. Substituir data: any por data: unknown (em payments)
find src/shared/types -name "payments.ts" -exec sed -i 's/data: any;/data: unknown;/g' {} +

# 11. Substituir settings?: Record<string, any> por settings?: Record<string, unknown>
find src/shared/types -name "*.ts" -type f -exec sed -i 's/settings?: Record<string, any>/settings?: Record<string, unknown>/g' {} +

# 12. Substituir [key: string]: any por [key: string]: unknown
find src/shared/types -name "*.ts" -type f -exec sed -i 's/\[key: string\]: any/[key: string]: unknown/g' {} +

# 13. Casos especiais em logger
find src/shared/services/logger -name "*.ts" -type f -exec sed -i 's/private formatMetadata(metadata?: Record<string, any>)/private formatMetadata(metadata?: Record<string, unknown>)/g' {} +

echo "Substituições concluídas!"
