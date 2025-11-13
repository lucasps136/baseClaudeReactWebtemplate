// User domain types - UI specific
export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  bio?: string;
}

export interface UpdateUserInput {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface UserListFilter {
  search?: string;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface UserListResponse {
  users: UserProfile[];
  total: number;
  hasMore: boolean;
}
