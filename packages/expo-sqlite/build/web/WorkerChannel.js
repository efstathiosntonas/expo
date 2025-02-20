import { Deferred } from './Deferred';
let messageId = 0;
const deferredMap = new Map();
const PENDING = 1;
const RESOLVED = 2;
export function sendWorkerResult({ id, result, error, syncTrait, }) {
    if (syncTrait) {
        const { lockBuffer, resultBuffer } = syncTrait;
        const lockArray = new Int32Array(lockBuffer);
        const resultArray = new Uint8Array(resultBuffer);
        const resultJson = result ? JSON.stringify({ result }) : JSON.stringify({ error });
        const resultBytes = new TextEncoder().encode(resultJson);
        const length = resultBytes.length;
        resultArray.set(new Uint32Array([length]), 0);
        resultArray.set(resultBytes, 4);
        Atomics.store(lockArray, 0, RESOLVED);
    }
    else {
        self.postMessage(result ? { id, result } : { id, error });
    }
}
export function workerMessageHandler(event) {
    const { id, result, error, isSync } = event.data;
    if (!isSync) {
        const deferred = deferredMap.get(id);
        if (deferred) {
            if (error) {
                deferred.reject(new Error(error));
            }
            else {
                deferred.resolve(result);
            }
            deferredMap.delete(id);
        }
    }
}
export async function invokeWorkerAsync(worker, type, data) {
    const id = messageId++;
    const deferred = new Deferred();
    deferredMap.set(id, deferred);
    worker.postMessage({ type, id, data, isSync: false });
    return deferred.getPromise();
}
export function invokeWorkerSync(worker, type, data) {
    const id = messageId++;
    const lockBuffer = new SharedArrayBuffer(4);
    const lockArray = new Int32Array(lockBuffer);
    const resultBuffer = new SharedArrayBuffer(1024 * 1024);
    const resultArray = new Uint8Array(resultBuffer);
    Atomics.store(lockArray, 0, PENDING);
    worker.postMessage({
        type,
        id,
        data,
        lockBuffer,
        resultBuffer,
        isSync: true,
    });
    let i = 0;
    while (Atomics.load(lockArray, 0) === PENDING) {
        void 0;
        ++i;
        if (i > 1000000000) {
            throw new Error('Sync operation timeout');
        }
    }
    const length = new Uint32Array(resultArray.buffer, 0, 1)[0];
    const resultCopy = new Uint8Array(length);
    resultCopy.set(new Uint8Array(resultArray.buffer, 4, length));
    const resultJson = new TextDecoder().decode(resultCopy);
    const { result, error } = JSON.parse(resultJson);
    if (error)
        throw new Error(error);
    return result;
}
//# sourceMappingURL=WorkerChannel.js.map