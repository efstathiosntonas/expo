import {
  type SQLiteBindBlobParams,
  type SQLiteBindPrimitiveParams,
  type SQLiteColumnNames,
  type SQLiteColumnValues,
} from '../NativeStatement';

export interface SyncWorkerMessage {
  id: number;
  isSync: true;
  lockBuffer: SharedArrayBuffer;
  resultBuffer: SharedArrayBuffer;
}

export interface AsyncWorkerMessage {
  id: number;
  isSync: false;
}

export type BaseWorkerMessage = SyncWorkerMessage | AsyncWorkerMessage;

type OpenMessage = BaseWorkerMessage & {
  type: 'open';
  data: {
    databaseName: string;
  };
};

type IsInTransactionMessage = BaseWorkerMessage & {
  type: 'isInTransaction';
  data: {
    databaseName: string;
  };
};

type CloseMessage = BaseWorkerMessage & {
  type: 'close';
  data: {
    databaseName: string;
  };
};

type ExecMessage = BaseWorkerMessage & {
  type: 'exec';
  data: {
    databaseName: string;
    source: string;
  };
};

type PrepareMessage = BaseWorkerMessage & {
  type: 'prepare';
  data: {
    databaseName: string;
    source: string;
  };
};

type RunMessage = BaseWorkerMessage & {
  type: 'run';
  data: {
    databaseName: string;
    statementId: number;
    bindParams: SQLiteBindPrimitiveParams;
    bindBlobParams: SQLiteBindBlobParams;
    shouldPassAsArray: boolean;
  };
};

type StepMessage = BaseWorkerMessage & {
  type: 'step';
  data: {
    databaseName: string;
    statementId: number;
  };
};

type GetAllMessage = BaseWorkerMessage & {
  type: 'getAll';
  data: {
    databaseName: string;
    statementId: number;
  };
};

type ResetMessage = BaseWorkerMessage & {
  type: 'reset';
  data: {
    databaseName: string;
    statementId: number;
  };
};

type GetColumnNamesMessage = BaseWorkerMessage & {
  type: 'getColumnNames';
  data: {
    statementId: number;
  };
};

type FinalizeMessage = BaseWorkerMessage & {
  type: 'finalize';
  data: {
    databaseName: string;
    statementId: number;
  };
};

type DeleteDatabaseMessage = BaseWorkerMessage & {
  type: 'deleteDatabase';
  data: {
    databaseName: string;
  };
};

export type SQLiteWorkerMessageType = keyof MessageTypeMap;
export type SQLiteWorkerMessage = MessageTypeMap[SQLiteWorkerMessageType];

// Message type mapping
export interface MessageTypeMap {
  open: OpenMessage;
  isInTransaction: IsInTransactionMessage;
  close: CloseMessage;
  exec: ExecMessage;
  prepare: PrepareMessage;
  run: RunMessage;
  step: StepMessage;
  getAll: GetAllMessage;
  reset: ResetMessage;
  getColumnNames: GetColumnNamesMessage;
  finalize: FinalizeMessage;
  deleteDatabase: DeleteDatabaseMessage;
}

// Result types
interface PrepareResult {
  statementId: number;
}

interface RunResult {
  lastInsertRowId: number;
  changes: number;
  firstRowValues: SQLiteColumnValues;
}

// Result type mapping
export interface ResultTypeMap {
  open: void;
  isInTransaction: boolean;
  close: void;
  exec: void;
  prepare: PrepareResult;
  run: RunResult;
  step: SQLiteColumnValues | null;
  getAll: SQLiteColumnValues[];
  reset: void;
  getColumnNames: SQLiteColumnNames;
  finalize: void;
  deleteDatabase: void;
}

export type ResultType = ResultTypeMap[keyof ResultTypeMap];

export type SQLiteWorkerResponse = {
  id: number;
  result?: ResultType;
  error?: Error;
};
