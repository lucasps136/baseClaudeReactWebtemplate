/**
 * Global type definitions used throughout the application
 */

export interface IApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
  status: "success" | "error";
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISelectOption {
  label: string;
  value: string;
  disabled?: boolean;
}

export interface INavItem {
  title: string;
  href?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
}

export interface ISiteConfig {
  name: string;
  description: string;
  url: string;
  ogImage: string;
  links: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export interface IFeatureFlag {
  name: string;
  enabled: boolean;
  description?: string;
}

/**
 * Utility types
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ValueOf<T> = T[keyof T];

/**
 * Environment types
 */
export type Environment = "development" | "production" | "test";

/**
 * Theme types
 */
export type Theme = "light" | "dark" | "system";

/**
 * Common component props
 */
export interface IBaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface IWithLoading {
  isLoading?: boolean;
}

export interface IWithError {
  error?: string | null;
}

/**
 * Form types
 */
export interface IFormFieldError {
  message: string;
  type: string;
}

export interface IFormState<T = unknown> {
  data: T;
  errors: Record<string, IFormFieldError>;
  isSubmitting: boolean;
  isValid: boolean;
}
