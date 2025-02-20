import { NativeModule } from 'expo';
import { type SQLiteOpenOptions } from '../NativeDatabase';
import { type SQLiteBindBlobParams, type SQLiteBindPrimitiveParams, type SQLiteColumnNames, type SQLiteColumnValues, type SQLiteRunResult } from '../NativeStatement';
declare class NativeDatabase {
    readonly databaseName: string;
    constructor(databaseName: string, options?: SQLiteOpenOptions, serializedData?: Uint8Array);
    initAsync(): Promise<void>;
    initSync(): void;
    isInTransactionAsync(): Promise<boolean>;
    isInTransactionSync(): boolean;
    closeAsync(): Promise<void>;
    closeSync(): void;
    execAsync(source: string): Promise<void>;
    execSync(source: string): void;
    prepareAsync(nativeStatement: NativeStatement, source: string): Promise<void>;
    prepareSync(nativeStatement: NativeStatement, source: string): void;
}
declare class NativeStatement {
    statementId: number | null;
    runAsync(database: NativeDatabase, bindParams: SQLiteBindPrimitiveParams, bindBlobParams: SQLiteBindBlobParams, shouldPassAsArray: boolean): Promise<SQLiteRunResult & {
        firstRowValues: SQLiteColumnValues;
    }>;
    runSync(database: NativeDatabase, bindParams: SQLiteBindPrimitiveParams, bindBlobParams: SQLiteBindBlobParams, shouldPassAsArray: boolean): SQLiteRunResult & {
        firstRowValues: SQLiteColumnValues;
    };
    stepAsync(database: NativeDatabase): Promise<SQLiteColumnValues | null>;
    stepSync(database: NativeDatabase): SQLiteColumnValues | null;
    getAllAsync(database: NativeDatabase): Promise<SQLiteColumnValues[]>;
    getAllSync(database: NativeDatabase): SQLiteColumnValues[];
    resetAsync(database: NativeDatabase): Promise<void>;
    resetSync(database: NativeDatabase): void;
    getColumnNamesAsync(): Promise<SQLiteColumnNames>;
    getColumnNamesSync(): SQLiteColumnNames;
    finalizeAsync(database: NativeDatabase): Promise<void>;
    finalizeSync(database: NativeDatabase): void;
}
export declare class SQLiteModule extends NativeModule {
    private hasListeners;
    readonly defaultDatabaseDirectory = ".";
    startObserving(): void;
    stopObserving(): void;
    deleteDatabaseAsync(databasePath: string): Promise<void>;
    deleteDatabaseSync(databasePath: string): void;
    ensureDatabasePathExistsAsync(databasePath: string): Promise<void>;
    ensureDatabasePathExistsSync(databasePath: string): void;
    importAssetDatabaseAsync(databasePath: string, assetDatabasePath: string, forceOverwrite: boolean): Promise<void>;
    readonly NativeDatabase: typeof NativeDatabase;
    readonly NativeStatement: typeof NativeStatement;
}
declare const _default: typeof SQLiteModule;
export default _default;
//# sourceMappingURL=SQLiteModule.d.ts.map