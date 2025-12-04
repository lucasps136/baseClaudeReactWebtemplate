// Tipos base para operações de banco
export interface IDatabaseRecord {
  id: string;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}

export interface IQueryOptions {
  select?: string[];
  where?: Record<string, unknown>;
  orderBy?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
}

export interface IInsertData {
  [key: string]: unknown;
}

export interface IUpdateData {
  [key: string]: unknown;
}

export interface IUpsertData extends IInsertData {
  id?: string;
}

export interface IDatabaseResponse<T = unknown> {
  data: T | null;
  error: IDatabaseError | null;
  count?: number;
}

export interface IDatabaseError {
  code: string;
  message: string;
  details?: unknown;
  hint?: string;
}

export interface ITransactionContext {
  id: string;
  isActive: boolean;
}

export interface IRealtimeSubscription {
  id: string;
  table: string;
  unsubscribe: () => void;
}

export interface IRealtimeEvent<T = unknown> {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new?: T;
  old?: T;
  table: string;
  schema: string;
  commit_timestamp: string;
}

export type RealtimeCallback<T = unknown> = (event: IRealtimeEvent<T>) => void;

// Interface principal do provider (DIP)
export interface IDatabaseProvider {
  // Conexão e configuração
  isConnected(): Promise<boolean>;
  getHealth(): Promise<{ status: "healthy" | "unhealthy"; details?: unknown }>;

  // CRUD Operations (Single Responsibility)
  // Create
  insert<T extends IDatabaseRecord>(
    table: string,
    data: IInsertData | IInsertData[],
  ): Promise<IDatabaseResponse<T[]>>;

  // Read
  select<T extends IDatabaseRecord>(
    table: string,
    options?: IQueryOptions,
  ): Promise<IDatabaseResponse<T[]>>;

  selectOne<T extends IDatabaseRecord>(
    table: string,
    id: string,
  ): Promise<IDatabaseResponse<T>>;

  selectBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    options?: Omit<IQueryOptions, "where">,
  ): Promise<IDatabaseResponse<T[]>>;

  // Update
  update<T extends IDatabaseRecord>(
    table: string,
    id: string,
    data: IUpdateData,
  ): Promise<IDatabaseResponse<T>>;

  updateBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
    data: IUpdateData,
  ): Promise<IDatabaseResponse<T[]>>;

  // Delete
  delete<T extends IDatabaseRecord>(
    table: string,
    id: string,
  ): Promise<IDatabaseResponse<T>>;

  deleteBy<T extends IDatabaseRecord>(
    table: string,
    field: string,
    value: unknown,
  ): Promise<IDatabaseResponse<T[]>>;

  // Upsert
  upsert<T extends IDatabaseRecord>(
    table: string,
    data: IUpsertData | IUpsertData[],
    conflictColumns?: string[],
  ): Promise<IDatabaseResponse<T[]>>;

  // Raw Queries (para casos complexos)
  query<T = unknown>(
    sql: string,
    params?: unknown[],
  ): Promise<IDatabaseResponse<T[]>>;

  // Transações (ACID)
  transaction<T>(
    callback: (ctx: ITransactionContext) => Promise<T>,
  ): Promise<IDatabaseResponse<T>>;

  // Realtime (Observer Pattern)
  subscribe<T extends Record<string, any> = any>( // eslint-disable-line @typescript-eslint/no-explicit-any
    table: string,
    callback: RealtimeCallback<T>,
    options?: { event?: "INSERT" | "UPDATE" | "DELETE" | "*" },
  ): Promise<IRealtimeSubscription>;

  unsubscribe(subscriptionId: string): Promise<void>;

  // Utilidades
  count(
    table: string,
    options?: Pick<IQueryOptions, "where">,
  ): Promise<IDatabaseResponse<number>>;
  exists(table: string, id: string): Promise<IDatabaseResponse<boolean>>;

  // Storage (se aplicável)
  uploadFile?(
    bucket: string,
    path: string,
    file: File | Buffer,
  ): Promise<IDatabaseResponse<{ path: string; url: string }>>;
  downloadFile?(
    bucket: string,
    path: string,
  ): Promise<IDatabaseResponse<{ data: Blob; url: string }>>;
  deleteFile?(bucket: string, path: string): Promise<IDatabaseResponse<void>>;

  // Inicialização e cleanup
  initialize(): Promise<void>;
  cleanup(): Promise<void>;
}

// Tipos para Strategy Pattern
export type DatabaseProviderType =
  | "supabase"
  | "planetscale"
  | "prisma"
  | "mongodb";

export interface IDatabaseProviderConfig {
  type: DatabaseProviderType;
  options: Record<string, unknown>;
}

// Tipos específicos para Supabase
export interface ISupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

// Tipos específicos para PlanetScale
export interface IPlanetScaleConfig {
  host: string;
  username: string;
  password: string;
  database: string;
}

// Tipos específicos para Prisma
export interface IPrismaConfig {
  databaseUrl: string;
}

// Tipos específicos para MongoDB
export interface IMongoDBConfig {
  connectionString: string;
  database: string;
}
