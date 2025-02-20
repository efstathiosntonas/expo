import { registerWebModule, NativeModule } from 'expo';
import { invokeWorkerAsync, invokeWorkerSync, workerMessageHandler } from './WorkerChannel';
let worker = null;
function getWorker() {
    if (!worker) {
        worker = new Worker('/worker.js', { type: 'module' });
        worker.addEventListener('message', workerMessageHandler);
    }
    return worker;
}
class NativeDatabase {
    databaseName;
    constructor(databaseName, options, serializedData) {
        this.databaseName = databaseName;
        if (serializedData != null) {
            throw new Error('TODO');
        }
    }
    async initAsync() {
        await invokeWorkerAsync(getWorker(), 'open', {
            databaseName: this.databaseName,
        });
    }
    initSync() {
        invokeWorkerSync(getWorker(), 'open', {
            databaseName: this.databaseName,
        });
    }
    async isInTransactionAsync() {
        return await invokeWorkerAsync(getWorker(), 'isInTransaction', {
            databaseName: this.databaseName,
        });
    }
    isInTransactionSync() {
        return invokeWorkerSync(getWorker(), 'isInTransaction', {
            databaseName: this.databaseName,
        });
    }
    async closeAsync() {
        await invokeWorkerAsync(getWorker(), 'close', {
            databaseName: this.databaseName,
        });
    }
    closeSync() {
        invokeWorkerSync(getWorker(), 'close', {
            databaseName: this.databaseName,
        });
    }
    async execAsync(source) {
        await invokeWorkerAsync(getWorker(), 'exec', {
            databaseName: this.databaseName,
            source,
        });
    }
    execSync(source) {
        invokeWorkerSync(getWorker(), 'exec', {
            databaseName: this.databaseName,
            source,
        });
    }
    async prepareAsync(nativeStatement, source) {
        const { statementId } = await invokeWorkerAsync(getWorker(), 'prepare', {
            databaseName: this.databaseName,
            source,
        });
        nativeStatement.statementId = statementId;
    }
    prepareSync(nativeStatement, source) {
        const { statementId } = invokeWorkerSync(getWorker(), 'prepare', {
            databaseName: this.databaseName,
            source,
        });
        nativeStatement.statementId = statementId;
    }
}
class NativeStatement {
    statementId = null;
    async runAsync(database, bindParams, bindBlobParams, shouldPassAsArray) {
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
    runSync(database, bindParams, bindBlobParams, shouldPassAsArray) {
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
    async stepAsync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        return await invokeWorkerAsync(getWorker(), 'step', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
    }
    stepSync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        return invokeWorkerSync(getWorker(), 'step', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
    }
    async getAllAsync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        return await invokeWorkerAsync(getWorker(), 'getAll', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
    }
    getAllSync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        return invokeWorkerSync(getWorker(), 'getAll', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
    }
    async resetAsync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        await invokeWorkerAsync(getWorker(), 'reset', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
    }
    resetSync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        invokeWorkerSync(getWorker(), 'reset', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
    }
    async getColumnNamesAsync() {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        return await invokeWorkerAsync(getWorker(), 'getColumnNames', {
            statementId: this.statementId,
        });
    }
    getColumnNamesSync() {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        return invokeWorkerSync(getWorker(), 'getColumnNames', {
            statementId: this.statementId,
        });
    }
    async finalizeAsync(database) {
        if (this.statementId == null) {
            throw new Error('Statement not prepared');
        }
        await invokeWorkerAsync(getWorker(), 'finalize', {
            databaseName: database.databaseName,
            statementId: this.statementId,
        });
        this.statementId = null;
    }
    finalizeSync(database) {
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
    hasListeners = false;
    defaultDatabaseDirectory = '.';
    startObserving() {
        this.hasListeners = true;
    }
    stopObserving() {
        this.hasListeners = false;
    }
    async deleteDatabaseAsync(databasePath) {
        await invokeWorkerAsync(getWorker(), 'deleteDatabase', {
            databaseName: databasePath,
        });
    }
    deleteDatabaseSync(databasePath) {
        invokeWorkerSync(getWorker(), 'deleteDatabase', {
            databaseName: databasePath,
        });
    }
    async ensureDatabasePathExistsAsync(databasePath) {
        // No-op for web
    }
    ensureDatabasePathExistsSync(databasePath) {
        // No-op for web
    }
    async importAssetDatabaseAsync(databasePath, assetDatabasePath, forceOverwrite) {
        throw new Error('TODO');
    }
    NativeDatabase = NativeDatabase;
    NativeStatement = NativeStatement;
}
export default registerWebModule(SQLiteModule);
//# sourceMappingURL=SQLiteModule.js.map