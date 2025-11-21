#!/bin/bash

# Lista de substituições (old:new)
declare -A renames=(
  ["AuthProviderConfig"]="IAuthProviderConfig"
  ["AuthState"]="IAuthState"
  ["AuthError"]="IAuthError"
  ["DatabaseProviderConfig"]="IDatabaseProviderConfig"
  ["DatabaseRecord"]="IDatabaseRecord"
  ["DatabaseResponse"]="IDatabaseResponse"
  ["DatabaseError"]="IDatabaseError"
  ["RBACError"]="IRBACError"
  ["RBACProviderConfig"]="IRBACProviderConfig"
  ["Role"]="IRole"
  ["Permission"]="IPermission"
  ["UserRole"]="IUserRole"
  ["AssignRoleOptions"]="IAssignRoleOptions"
  ["ThemeConfig"]="IThemeConfig"
  ["CustomTheme"]="ICustomTheme"
  ["ThemeContextType"]="IThemeContextType"
  ["CreateThemeOptions"]="ICreateThemeOptions"
  ["PaymentProviderConfig"]="IPaymentProviderConfig"
)

cd D:/Docs/Bebarter/src

# Para cada arquivo .ts e .tsx
find . -type f \( -name "*.ts" -o -name "*.tsx" \) | while read file; do
  changed=false
  
  for old in "${!renames[@]}"; do
    new="${renames[$old]}"
    
    # Substitui apenas word boundaries (não afeta Stripe.Customer, etc.)
    if sed -i "s/\b${old}\b/${new}/g" "$file" 2>/dev/null; then
      if grep -q "$new" "$file"; then
        changed=true
      fi
    fi
  done
  
  if [ "$changed" = true ]; then
    echo "✅ $file"
  fi
done

echo "✨ Done!"
