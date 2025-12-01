const fs = require("fs");

// Revert UserList.tsx
const userListPath = "src/features/users/components/UserList.tsx";
let userListContent = fs.readFileSync(userListPath, "utf8");
userListContent = userListContent.replace(
  'import { useUsers } from "@/features/users/hooks";',
  'import { useUsers } from "../hooks";',
);
fs.writeFileSync(userListPath, userListContent);
console.log("Reverted UserList.tsx");

// Revert useUser.ts
const useUserPath = "src/features/users/hooks/useUser.ts";
let useUserContent = fs.readFileSync(useUserPath, "utf8");
useUserContent = useUserContent.replace(
  'import { useUserStore } from "@/features/users/stores/user.store";',
  'import { useUserStore } from "../stores/user.store";',
);
useUserContent = useUserContent.replace(
  'import type { IUserProfile } from "@/features/users/types/user.types";',
  'import type { IUserProfile } from "../types/user.types";',
);
fs.writeFileSync(useUserPath, useUserContent);
console.log("Reverted useUser.ts");

// Revert useUsers.ts
const useUsersPath = "src/features/users/hooks/useUsers.ts";
let useUsersContent = fs.readFileSync(useUsersPath, "utf8");
useUsersContent = useUsersContent.replace(
  'import { useUserStore } from "@/features/users/stores/user.store";',
  'import { useUserStore } from "../stores/user.store";',
);
useUsersContent = useUsersContent.replace(
  '} from "@/features/users/types/user.types";',
  '} from "../types/user.types";',
);
fs.writeFileSync(useUsersPath, useUsersContent);
console.log("Reverted useUsers.ts");

// Revert user.service.ts
const userServicePath = "src/features/users/services/user.service.ts";
let userServiceContent = fs.readFileSync(userServicePath, "utf8");
userServiceContent = userServiceContent.replace(
  '} from "@/features/users/types/user.types";',
  '} from "../types/user.types";',
);
fs.writeFileSync(userServicePath, userServiceContent);
console.log("Reverted user.service.ts");

// Revert user.store.ts
const userStorePath = "src/features/users/stores/user.store.ts";
let userStoreContent = fs.readFileSync(userStorePath, "utf8");
userStoreContent = userStoreContent.replace(
  'import type { IUserProfile, IUserListFilter } from "@/features/users/types/user.types";',
  'import type { IUserProfile, IUserListFilter } from "../types/user.types";',
);
fs.writeFileSync(userStorePath, userStoreContent);
console.log("Reverted user.store.ts");

console.log("All files reverted to relative imports!");
