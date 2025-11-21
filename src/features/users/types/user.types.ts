// IUser domain types - specific to user feature
export interface IUserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateUserInput {
  email: string;
  name: string;
  bio?: string;
}

export interface IUpdateUserInput {
  name?: string;
  bio?: string;
  avatar?: string;
}

export interface IUserListFilter {
  search?: string;
  sortBy?: "name" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface IUserListResponse {
  users: IUserProfile[];
  total: number;
  hasMore: boolean;
}
