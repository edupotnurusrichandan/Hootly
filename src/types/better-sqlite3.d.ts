declare module 'better-sqlite3' {
  export interface RunResult {
    changes: number;
    lastInsertRowid: number | bigint;
  }

  export interface Statement {
    run(...params: unknown[]): RunResult;
    get<T = Record<string, unknown>>(...params: unknown[]): T | undefined;
    all<T = Record<string, unknown>>(...params: unknown[]): T[];
  }

  export interface Database {
    exec(source: string): void;
    prepare(source: string): Statement;
    transaction<T>(operation: () => T): () => T;
    pragma(source: string): unknown;
    close(): void;
  }

  export default class BetterSqlite3 implements Database {
    constructor(filename: string, options?: { timeout?: number; readonly?: boolean; fileMustExist?: boolean });
    exec(source: string): void;
    prepare(source: string): Statement;
    transaction<T>(operation: () => T): () => T;
    pragma(source: string): unknown;
    close(): void;
  }
}
