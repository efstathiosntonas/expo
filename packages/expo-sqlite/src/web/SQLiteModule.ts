import { registerWebModule, NativeModule } from 'expo';

import { type SQLiteOpenOptions } from '../NativeDatabase';
import {
  type SQLiteBindBlobParams,
  type SQLiteBindPrimitiveParams,
  type SQLiteColumnNames,
  type SQLiteColumnValues,
  type SQLiteRunResult,
} from '../NativeStatement';
import { invokeWorkerAsync, invokeWorkerSync, workerMessageHandler } from './WorkerChannel';

let worker: Worker | null = null;

function getWorker(): Worker {
  if (!worker) {
    worker = new Worker('/worker.js', { type: 'module' });
    worker.addEventListener('message', workerMessageHandler);
  }
  return worker;
}

class NativeDatabase {
  constructor(
    public readonly databaseName: string,
    options?: SQLiteOpenOptions,
    serializedData?: Uint8Array
  ) {
    if (serializedData != null) {
      throw new Error('TODO');
    }
  }

  async initAsync(): Promise<void> {
    await invokeWorkerAsync(getWorker(), 'open', {
      databaseName: this.databaseName,
    });
  }
  initSync(): void {
    invokeWorkerSync(getWorker(), 'open', {
      databaseName: this.databaseName,
    });
  }

  async isInTransactionAsync(): Promise<boolean> {
    return await invokeWorkerAsync(getWorker(), 'isInTransaction', {
      databaseName: this.databaseName,
    });
  }
  isInTransactionSync(): boolean {
    return invokeWorkerSync(getWorker(), 'isInTransaction', {
      databaseName: this.databaseName,
    });
  }

  async closeAsync(): Promise<void> {
    await invokeWorkerAsync(getWorker(), 'close', {
      databaseName: this.databaseName,
    });
  }
  closeSync(): void {
    invokeWorkerSync(getWorker(), 'close', {
      databaseName: this.databaseName,
    });
  }

  async execAsync(source: string): Promise<void> {
    await invokeWorkerAsync(getWorker(), 'exec', {
      databaseName: this.databaseName,
      source,
    });
  }
  execSync(source: string): void {
    invokeWorkerSync(getWorker(), 'exec', {
      databaseName: this.databaseName,
      source,
    });
  }

  async prepareAsync(nativeStatement: NativeStatement, source: string) {
    const { statementId } = await invokeWorkerAsync(getWorker(), 'prepare', {
      databaseName: this.databaseName,
      source,
    });
    nativeStatement.statementId = statementId;
  }
  prepareSync(nativeStatement: NativeStatement, source: string): void {
    const { statementId } = invokeWorkerSync(getWorker(), 'prepare', {
      databaseName: this.databaseName,
      source,
    });
    nativeStatement.statementId = statementId;
  }
}

class NativeStatement {
  statementId: number | null = null;

  async runAsync(
    database: NativeDatabase,
    bindParams: SQLiteBindPrimitiveParams,
    bindBlobParams: SQLiteBindBlobParams,
    shouldPassAsArray: boolean
  ): Promise<SQLiteRunResult & { firstRowValues: SQLiteColumnValues }> {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return await invokeWorkerAsync(getWorker(), 'run', {
      databaseName: database.databaseName,
      statementId: this.statementId,
      bindParams,
      bindBlobParams,
      shouldPassAsArray,
    });
  }
  runSync(
    database: NativeDatabase,
    bindParams: SQLiteBindPrimitiveParams,
    bindBlobParams: SQLiteBindBlobParams,
    shouldPassAsArray: boolean
  ): SQLiteRunResult & { firstRowValues: SQLiteColumnValues } {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return invokeWorkerSync(getWorker(), 'run', {
      databaseName: database.databaseName,
      statementId: this.statementId,
      bindParams,
      bindBlobParams,
      shouldPassAsArray,
    });
  }

  async stepAsync(database: NativeDatabase): Promise<SQLiteColumnValues | null> {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return await invokeWorkerAsync(getWorker(), 'step', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
  }
  stepSync(database: NativeDatabase): SQLiteColumnValues | null {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return invokeWorkerSync(getWorker(), 'step', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
  }

  async getAllAsync(database: NativeDatabase): Promise<SQLiteColumnValues[]> {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return await invokeWorkerAsync(getWorker(), 'getAll', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
  }
  getAllSync(database: NativeDatabase): SQLiteColumnValues[] {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return invokeWorkerSync(getWorker(), 'getAll', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
  }

  async resetAsync(database: NativeDatabase): Promise<void> {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    await invokeWorkerAsync(getWorker(), 'reset', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
  }
  resetSync(database: NativeDatabase): void {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    invokeWorkerSync(getWorker(), 'reset', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
  }

  async getColumnNamesAsync(): Promise<SQLiteColumnNames> {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return await invokeWorkerAsync(getWorker(), 'getColumnNames', {
      statementId: this.statementId,
    });
  }
  getColumnNamesSync(): SQLiteColumnNames {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    return invokeWorkerSync(getWorker(), 'getColumnNames', {
      statementId: this.statementId,
    });
  }

  async finalizeAsync(database: NativeDatabase): Promise<void> {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    await invokeWorkerAsync(getWorker(), 'finalize', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
    this.statementId = null;
  }
  finalizeSync(database: NativeDatabase): void {
    if (this.statementId == null) {
      throw new Error('Statement not prepared');
    }
    invokeWorkerSync(getWorker(), 'finalize', {
      databaseName: database.databaseName,
      statementId: this.statementId,
    });
    this.statementId = null;
  }
}

export class SQLiteModule extends NativeModule {
  private hasListeners = false;

  readonly defaultDatabaseDirectory = '.';

  override startObserving() {
    this.hasListeners = true;
  }
  override stopObserving() {
    this.hasListeners = false;
  }

  async deleteDatabaseAsync(databasePath: string): Promise<void> {
    await invokeWorkerAsync(getWorker(), 'deleteDatabase', {
      databaseName: databasePath,
    });
  }
  deleteDatabaseSync(databasePath: string): void {
    invokeWorkerSync(getWorker(), 'deleteDatabase', {
      databaseName: databasePath,
    });
  }

  async ensureDatabasePathExistsAsync(databasePath: string): Promise<void> {
    // No-op for web
  }
  ensureDatabasePathExistsSync(databasePath: string): void {
    // No-op for web
  }

  async importAssetDatabaseAsync(
    databasePath: string,
    assetDatabasePath: string,
    forceOverwrite: boolean
  ): Promise<void> {
    throw new Error('TODO');
  }

  readonly NativeDatabase: typeof NativeDatabase = NativeDatabase;
  readonly NativeStatement: typeof NativeStatement = NativeStatement;
}

export default registerWebModule(SQLiteModule);
