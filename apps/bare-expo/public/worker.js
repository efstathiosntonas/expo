// src/web/WorkerChannel.ts
var deferredMap = new Map;
var RESOLVED = 2;
function sendWorkerResult({
  id,
  result,
  error,
  syncTrait
}) {
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
  } else {
    self.postMessage(result ? { id, result } : { id, error });
  }
}

// src/web/wa-sqlite/sqlite-constants.js
var SQLITE_OK = 0;
var SQLITE_IOERR = 10;
var SQLITE_NOTFOUND = 12;
var SQLITE_CANTOPEN = 14;
var SQLITE_MISUSE = 21;
var SQLITE_RANGE = 25;
var SQLITE_NOTICE = 27;
var SQLITE_ROW = 100;
var SQLITE_DONE = 101;
var SQLITE_IOERR_SHORT_READ = 522;
var SQLITE_IOERR_WRITE = 778;
var SQLITE_OPEN_READWRITE = 2;
var SQLITE_OPEN_CREATE = 4;
var SQLITE_OPEN_DELETEONCLOSE = 8;
var SQLITE_OPEN_URI = 64;
var SQLITE_OPEN_MAIN_DB = 256;
var SQLITE_OPEN_TEMP_DB = 512;
var SQLITE_OPEN_TRANSIENT_DB = 1024;
var SQLITE_OPEN_MAIN_JOURNAL = 2048;
var SQLITE_OPEN_TEMP_JOURNAL = 4096;
var SQLITE_OPEN_SUBJOURNAL = 8192;
var SQLITE_OPEN_SUPER_JOURNAL = 16384;
var SQLITE_OPEN_WAL = 524288;
var SQLITE_IOCAP_UNDELETABLE_WHEN_OPEN = 2048;
var SQLITE_INTEGER = 1;
var SQLITE_FLOAT = 2;
var SQLITE_TEXT = 3;
var SQLITE_BLOB = 4;
var SQLITE_NULL = 5;
var SQLITE_DESERIALIZE_FREEONCLOSE = 1;
var SQLITE_DESERIALIZE_RESIZEABLE = 2;

// src/web/wa-sqlite/VFS.js
var DEFAULT_SECTOR_SIZE = 512;

class Base {
  name;
  mxPathname = 64;
  _module;
  constructor(name, module) {
    this.name = name;
    this._module = module;
  }
  close() {
  }
  isReady() {
    return true;
  }
  hasAsyncMethod(methodName) {
    return false;
  }
  xOpen(pVfs, zName, pFile, flags, pOutFlags) {
    return SQLITE_CANTOPEN;
  }
  xDelete(pVfs, zName, syncDir) {
    return SQLITE_OK;
  }
  xAccess(pVfs, zName, flags, pResOut) {
    return SQLITE_OK;
  }
  xFullPathname(pVfs, zName, nOut, zOut) {
    return SQLITE_OK;
  }
  xGetLastError(pVfs, nBuf, zBuf) {
    return SQLITE_OK;
  }
  xClose(pFile) {
    return SQLITE_OK;
  }
  xRead(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    return SQLITE_OK;
  }
  xWrite(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    return SQLITE_OK;
  }
  xTruncate(pFile, sizeLo, sizeHi) {
    return SQLITE_OK;
  }
  xSync(pFile, flags) {
    return SQLITE_OK;
  }
  xFileSize(pFile, pSize) {
    return SQLITE_OK;
  }
  xLock(pFile, lockType) {
    return SQLITE_OK;
  }
  xUnlock(pFile, lockType) {
    return SQLITE_OK;
  }
  xCheckReservedLock(pFile, pResOut) {
    return SQLITE_OK;
  }
  xFileControl(pFile, op, pArg) {
    return SQLITE_NOTFOUND;
  }
  xSectorSize(pFile) {
    return DEFAULT_SECTOR_SIZE;
  }
  xDeviceCharacteristics(pFile) {
    return 0;
  }
}
var FILE_TYPE_MASK = [
  SQLITE_OPEN_MAIN_DB,
  SQLITE_OPEN_MAIN_JOURNAL,
  SQLITE_OPEN_TEMP_DB,
  SQLITE_OPEN_TEMP_JOURNAL,
  SQLITE_OPEN_TRANSIENT_DB,
  SQLITE_OPEN_SUBJOURNAL,
  SQLITE_OPEN_SUPER_JOURNAL,
  SQLITE_OPEN_WAL
].reduce((mask, element) => mask | element);

// src/web/wa-sqlite/FacadeVFS.js
var AsyncFunction = Object.getPrototypeOf(async function() {
}).constructor;

class FacadeVFS extends Base {
  constructor(name, module) {
    super(name, module);
  }
  hasAsyncMethod(methodName) {
    const jMethodName = `j${methodName.slice(1)}`;
    return this[jMethodName] instanceof AsyncFunction;
  }
  getFilename(pFile) {
    throw new Error("unimplemented");
  }
  jOpen(filename, pFile, flags, pOutFlags) {
    return SQLITE_CANTOPEN;
  }
  jDelete(filename, syncDir) {
    return SQLITE_OK;
  }
  jAccess(filename, flags, pResOut) {
    return SQLITE_OK;
  }
  jFullPathname(filename, zOut) {
    const { read, written } = new TextEncoder().encodeInto(filename, zOut);
    if (read < filename.length)
      return SQLITE_IOERR;
    if (written >= zOut.length)
      return SQLITE_IOERR;
    zOut[written] = 0;
    return SQLITE_OK;
  }
  jGetLastError(zBuf) {
    return SQLITE_OK;
  }
  jClose(pFile) {
    return SQLITE_OK;
  }
  jRead(pFile, pData, iOffset) {
    pData.fill(0);
    return SQLITE_IOERR_SHORT_READ;
  }
  jWrite(pFile, pData, iOffset) {
    return SQLITE_IOERR_WRITE;
  }
  jTruncate(pFile, size) {
    return SQLITE_OK;
  }
  jSync(pFile, flags) {
    return SQLITE_OK;
  }
  jFileSize(pFile, pSize) {
    return SQLITE_OK;
  }
  jLock(pFile, lockType) {
    return SQLITE_OK;
  }
  jUnlock(pFile, lockType) {
    return SQLITE_OK;
  }
  jCheckReservedLock(pFile, pResOut) {
    pResOut.setInt32(0, 0, true);
    return SQLITE_OK;
  }
  jFileControl(pFile, op, pArg) {
    return SQLITE_NOTFOUND;
  }
  jSectorSize(pFile) {
    return super.xSectorSize(pFile);
  }
  jDeviceCharacteristics(pFile) {
    return 0;
  }
  xOpen(pVfs, zName, pFile, flags, pOutFlags) {
    const filename = this.#decodeFilename(zName, flags);
    const pOutFlagsView = this.#makeTypedDataView("Int32", pOutFlags);
    this["log"]?.("jOpen", filename, pFile, "0x" + flags.toString(16));
    return this.jOpen(filename, pFile, flags, pOutFlagsView);
  }
  xDelete(pVfs, zName, syncDir) {
    const filename = this._module.UTF8ToString(zName);
    this["log"]?.("jDelete", filename, syncDir);
    return this.jDelete(filename, syncDir);
  }
  xAccess(pVfs, zName, flags, pResOut) {
    const filename = this._module.UTF8ToString(zName);
    const pResOutView = this.#makeTypedDataView("Int32", pResOut);
    this["log"]?.("jAccess", filename, flags);
    return this.jAccess(filename, flags, pResOutView);
  }
  xFullPathname(pVfs, zName, nOut, zOut) {
    const filename = this._module.UTF8ToString(zName);
    const zOutArray = this._module.HEAPU8.subarray(zOut, zOut + nOut);
    this["log"]?.("jFullPathname", filename, nOut);
    return this.jFullPathname(filename, zOutArray);
  }
  xGetLastError(pVfs, nBuf, zBuf) {
    const zBufArray = this._module.HEAPU8.subarray(zBuf, zBuf + nBuf);
    this["log"]?.("jGetLastError", nBuf);
    return this.jGetLastError(zBufArray);
  }
  xClose(pFile) {
    this["log"]?.("jClose", pFile);
    return this.jClose(pFile);
  }
  xRead(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    const pDataArray = this.#makeDataArray(pData, iAmt);
    const iOffset = delegalize(iOffsetLo, iOffsetHi);
    this["log"]?.("jRead", pFile, iAmt, iOffset);
    return this.jRead(pFile, pDataArray, iOffset);
  }
  xWrite(pFile, pData, iAmt, iOffsetLo, iOffsetHi) {
    const pDataArray = this.#makeDataArray(pData, iAmt);
    const iOffset = delegalize(iOffsetLo, iOffsetHi);
    this["log"]?.("jWrite", pFile, pDataArray, iOffset);
    return this.jWrite(pFile, pDataArray, iOffset);
  }
  xTruncate(pFile, sizeLo, sizeHi) {
    const size = delegalize(sizeLo, sizeHi);
    this["log"]?.("jTruncate", pFile, size);
    return this.jTruncate(pFile, size);
  }
  xSync(pFile, flags) {
    this["log"]?.("jSync", pFile, flags);
    return this.jSync(pFile, flags);
  }
  xFileSize(pFile, pSize) {
    const pSizeView = this.#makeTypedDataView("BigInt64", pSize);
    this["log"]?.("jFileSize", pFile);
    return this.jFileSize(pFile, pSizeView);
  }
  xLock(pFile, lockType) {
    this["log"]?.("jLock", pFile, lockType);
    return this.jLock(pFile, lockType);
  }
  xUnlock(pFile, lockType) {
    this["log"]?.("jUnlock", pFile, lockType);
    return this.jUnlock(pFile, lockType);
  }
  xCheckReservedLock(pFile, pResOut) {
    const pResOutView = this.#makeTypedDataView("Int32", pResOut);
    this["log"]?.("jCheckReservedLock", pFile);
    return this.jCheckReservedLock(pFile, pResOutView);
  }
  xFileControl(pFile, op, pArg) {
    const pArgView = new DataView(this._module.HEAPU8.buffer, this._module.HEAPU8.byteOffset + pArg);
    this["log"]?.("jFileControl", pFile, op, pArgView);
    return this.jFileControl(pFile, op, pArgView);
  }
  xSectorSize(pFile) {
    this["log"]?.("jSectorSize", pFile);
    return this.jSectorSize(pFile);
  }
  xDeviceCharacteristics(pFile) {
    this["log"]?.("jDeviceCharacteristics", pFile);
    return this.jDeviceCharacteristics(pFile);
  }
  #makeTypedDataView(type, byteOffset) {
    const byteLength = type === "Int32" ? 4 : 8;
    const getter = `get${type}`;
    const setter = `set${type}`;
    const makeDataView = () => new DataView(this._module.HEAPU8.buffer, this._module.HEAPU8.byteOffset + byteOffset, byteLength);
    let dataView = makeDataView();
    return new Proxy(dataView, {
      get(_, prop) {
        if (dataView.buffer.byteLength === 0) {
          dataView = makeDataView();
        }
        if (prop === getter) {
          return function(byteOffset2, littleEndian) {
            if (!littleEndian)
              throw new Error("must be little endian");
            return dataView[prop](byteOffset2, littleEndian);
          };
        }
        if (prop === setter) {
          return function(byteOffset2, value, littleEndian) {
            if (!littleEndian)
              throw new Error("must be little endian");
            return dataView[prop](byteOffset2, value, littleEndian);
          };
        }
        if (typeof prop === "string" && prop.match(/^(get)|(set)/)) {
          throw new Error("invalid type");
        }
        const result = dataView[prop];
        return typeof result === "function" ? result.bind(dataView) : result;
      }
    });
  }
  #makeDataArray(byteOffset, byteLength) {
    let target = this._module.HEAPU8.subarray(byteOffset, byteOffset + byteLength);
    return new Proxy(target, {
      get: (_, prop, receiver) => {
        if (target.buffer.byteLength === 0) {
          target = this._module.HEAPU8.subarray(byteOffset, byteOffset + byteLength);
        }
        const result = target[prop];
        return typeof result === "function" ? result.bind(target) : result;
      }
    });
  }
  #decodeFilename(zName, flags) {
    if (flags & SQLITE_OPEN_URI) {
      let pName = zName;
      let state = 1;
      const charCodes = [];
      while (state) {
        const charCode = this._module.HEAPU8[pName++];
        if (charCode) {
          charCodes.push(charCode);
        } else {
          if (!this._module.HEAPU8[pName])
            state = null;
          switch (state) {
            case 1:
              charCodes.push(63);
              state = 2;
              break;
            case 2:
              charCodes.push(61);
              state = 3;
              break;
            case 3:
              charCodes.push(38);
              state = 2;
              break;
          }
        }
      }
      return new TextDecoder().decode(new Uint8Array(charCodes));
    }
    return zName ? this._module.UTF8ToString(zName) : null;
  }
}
function delegalize(lo32, hi32) {
  return hi32 * 4294967296 + lo32 + (lo32 < 0 ? 2 ** 32 : 0);
}

// src/web/wa-sqlite/AccessHandlePoolVFS.js
var SECTOR_SIZE = 4096;
var HEADER_MAX_PATH_SIZE = 512;
var HEADER_FLAGS_SIZE = 4;
var HEADER_DIGEST_SIZE = 8;
var HEADER_CORPUS_SIZE = HEADER_MAX_PATH_SIZE + HEADER_FLAGS_SIZE;
var HEADER_OFFSET_FLAGS = HEADER_MAX_PATH_SIZE;
var HEADER_OFFSET_DIGEST = HEADER_CORPUS_SIZE;
var HEADER_OFFSET_DATA = SECTOR_SIZE;
var PERSISTENT_FILE_TYPES = SQLITE_OPEN_MAIN_DB | SQLITE_OPEN_MAIN_JOURNAL | SQLITE_OPEN_SUPER_JOURNAL | SQLITE_OPEN_WAL;
var DEFAULT_CAPACITY = 6;

class AccessHandlePoolVFS extends FacadeVFS {
  log = null;
  #directoryPath;
  #directoryHandle;
  #mapAccessHandleToName = new Map;
  #mapPathToAccessHandle = new Map;
  #availableAccessHandles = new Set;
  #mapIdToFile = new Map;
  static async create(name, module) {
    const vfs = new AccessHandlePoolVFS(name, module);
    await vfs.isReady();
    return vfs;
  }
  constructor(name, module) {
    super(name, module);
    this.#directoryPath = name;
  }
  jOpen(zName, fileId, flags, pOutFlags) {
    try {
      const path = zName ? this.#getPath(zName) : Math.random().toString(36);
      let accessHandle = this.#mapPathToAccessHandle.get(path);
      if (!accessHandle && flags & SQLITE_OPEN_CREATE) {
        if (this.getSize() < this.getCapacity()) {
          [accessHandle] = this.#availableAccessHandles.keys();
          this.#setAssociatedPath(accessHandle, path, flags);
        } else {
          throw new Error("cannot create file");
        }
      }
      if (!accessHandle) {
        throw new Error("file not found");
      }
      const file = { path, flags, accessHandle };
      this.#mapIdToFile.set(fileId, file);
      pOutFlags.setInt32(0, flags, true);
      return SQLITE_OK;
    } catch (e) {
      console.error(e.message);
      return SQLITE_CANTOPEN;
    }
  }
  jClose(fileId) {
    const file = this.#mapIdToFile.get(fileId);
    if (file) {
      file.accessHandle.flush();
      this.#mapIdToFile.delete(fileId);
      if (file.flags & SQLITE_OPEN_DELETEONCLOSE) {
        this.#deletePath(file.path);
      }
    }
    return SQLITE_OK;
  }
  jRead(fileId, pData, iOffset) {
    const file = this.#mapIdToFile.get(fileId);
    const nBytes = file.accessHandle.read(pData.subarray(), { at: HEADER_OFFSET_DATA + iOffset });
    if (nBytes < pData.byteLength) {
      pData.fill(0, nBytes, pData.byteLength);
      return SQLITE_IOERR_SHORT_READ;
    }
    return SQLITE_OK;
  }
  jWrite(fileId, pData, iOffset) {
    const file = this.#mapIdToFile.get(fileId);
    const nBytes = file.accessHandle.write(pData.subarray(), { at: HEADER_OFFSET_DATA + iOffset });
    return nBytes === pData.byteLength ? SQLITE_OK : SQLITE_IOERR;
  }
  jTruncate(fileId, iSize) {
    const file = this.#mapIdToFile.get(fileId);
    file.accessHandle.truncate(HEADER_OFFSET_DATA + iSize);
    return SQLITE_OK;
  }
  jSync(fileId, flags) {
    const file = this.#mapIdToFile.get(fileId);
    file.accessHandle.flush();
    return SQLITE_OK;
  }
  jFileSize(fileId, pSize64) {
    const file = this.#mapIdToFile.get(fileId);
    const size = file.accessHandle.getSize() - HEADER_OFFSET_DATA;
    pSize64.setBigInt64(0, BigInt(size), true);
    return SQLITE_OK;
  }
  jSectorSize(fileId) {
    return SECTOR_SIZE;
  }
  jDeviceCharacteristics(fileId) {
    return SQLITE_IOCAP_UNDELETABLE_WHEN_OPEN;
  }
  jAccess(zName, flags, pResOut) {
    const path = this.#getPath(zName);
    pResOut.setInt32(0, this.#mapPathToAccessHandle.has(path) ? 1 : 0, true);
    return SQLITE_OK;
  }
  jDelete(zName, syncDir) {
    const path = this.#getPath(zName);
    this.#deletePath(path);
    return SQLITE_OK;
  }
  async close() {
    await this.#releaseAccessHandles();
  }
  async isReady() {
    if (!this.#directoryHandle) {
      let handle = await navigator.storage.getDirectory();
      for (const d of this.#directoryPath.split("/")) {
        if (d) {
          handle = await handle.getDirectoryHandle(d, { create: true });
        }
      }
      this.#directoryHandle = handle;
      await this.#acquireAccessHandles();
      if (this.getCapacity() === 0) {
        await this.addCapacity(DEFAULT_CAPACITY);
      }
    }
    return true;
  }
  getSize() {
    return this.#mapPathToAccessHandle.size;
  }
  getCapacity() {
    return this.#mapAccessHandleToName.size;
  }
  async addCapacity(n) {
    for (let i = 0;i < n; ++i) {
      const name = Math.random().toString(36).replace("0.", "");
      const handle = await this.#directoryHandle.getFileHandle(name, { create: true });
      const accessHandle = await handle.createSyncAccessHandle();
      this.#mapAccessHandleToName.set(accessHandle, name);
      this.#setAssociatedPath(accessHandle, "", 0);
    }
    return n;
  }
  async removeCapacity(n) {
    let nRemoved = 0;
    for (const accessHandle of Array.from(this.#availableAccessHandles)) {
      if (nRemoved == n || this.getSize() === this.getCapacity())
        return nRemoved;
      const name = this.#mapAccessHandleToName.get(accessHandle);
      await accessHandle.close();
      await this.#directoryHandle.removeEntry(name);
      this.#mapAccessHandleToName.delete(accessHandle);
      this.#availableAccessHandles.delete(accessHandle);
      ++nRemoved;
    }
    return nRemoved;
  }
  async#acquireAccessHandles() {
    const files = [];
    for await (const [name, handle] of this.#directoryHandle) {
      if (handle.kind === "file") {
        files.push([name, handle]);
      }
    }
    await Promise.all(files.map(async ([name, handle]) => {
      const accessHandle = await handle.createSyncAccessHandle();
      this.#mapAccessHandleToName.set(accessHandle, name);
      const path = this.#getAssociatedPath(accessHandle);
      if (path) {
        this.#mapPathToAccessHandle.set(path, accessHandle);
      } else {
        this.#availableAccessHandles.add(accessHandle);
      }
    }));
  }
  #releaseAccessHandles() {
    for (const accessHandle of this.#mapAccessHandleToName.keys()) {
      accessHandle.close();
    }
    this.#mapAccessHandleToName.clear();
    this.#mapPathToAccessHandle.clear();
    this.#availableAccessHandles.clear();
  }
  #getAssociatedPath(accessHandle) {
    const corpus = new Uint8Array(HEADER_CORPUS_SIZE);
    accessHandle.read(corpus, { at: 0 });
    const dataView = new DataView(corpus.buffer, corpus.byteOffset);
    const flags = dataView.getUint32(HEADER_OFFSET_FLAGS);
    if (corpus[0] && (flags & SQLITE_OPEN_DELETEONCLOSE || (flags & PERSISTENT_FILE_TYPES) === 0)) {
      console.warn(`Remove file with unexpected flags ${flags.toString(16)}`);
      this.#setAssociatedPath(accessHandle, "", 0);
      return "";
    }
    const fileDigest = new Uint32Array(HEADER_DIGEST_SIZE / 4);
    accessHandle.read(fileDigest, { at: HEADER_OFFSET_DIGEST });
    const computedDigest = this.#computeDigest(corpus);
    if (fileDigest.every((value, i) => value === computedDigest[i])) {
      const pathBytes = corpus.findIndex((value) => value === 0);
      if (pathBytes === 0) {
        accessHandle.truncate(HEADER_OFFSET_DATA);
      }
      return new TextDecoder().decode(corpus.subarray(0, pathBytes));
    } else {
      console.warn("Disassociating file with bad digest.");
      this.#setAssociatedPath(accessHandle, "", 0);
      return "";
    }
  }
  #setAssociatedPath(accessHandle, path, flags) {
    const corpus = new Uint8Array(HEADER_CORPUS_SIZE);
    const encodedResult = new TextEncoder().encodeInto(path, corpus);
    if (encodedResult.written >= HEADER_MAX_PATH_SIZE) {
      throw new Error("path too long");
    }
    const dataView = new DataView(corpus.buffer, corpus.byteOffset);
    dataView.setUint32(HEADER_OFFSET_FLAGS, flags);
    const digest = this.#computeDigest(corpus);
    accessHandle.write(corpus, { at: 0 });
    accessHandle.write(digest, { at: HEADER_OFFSET_DIGEST });
    accessHandle.flush();
    if (path) {
      this.#mapPathToAccessHandle.set(path, accessHandle);
      this.#availableAccessHandles.delete(accessHandle);
    } else {
      accessHandle.truncate(HEADER_OFFSET_DATA);
      this.#availableAccessHandles.add(accessHandle);
    }
  }
  #computeDigest(corpus) {
    if (!corpus[0]) {
      return new Uint32Array([4274806656, 2899230775]);
    }
    let h1 = 3735928559;
    let h2 = 1103547991;
    for (const value of corpus) {
      h1 = Math.imul(h1 ^ value, 2654435761);
      h2 = Math.imul(h2 ^ value, 1597334677);
    }
    h1 = Math.imul(h1 ^ h1 >>> 16, 2246822507) ^ Math.imul(h2 ^ h2 >>> 13, 3266489909);
    h2 = Math.imul(h2 ^ h2 >>> 16, 2246822507) ^ Math.imul(h1 ^ h1 >>> 13, 3266489909);
    return new Uint32Array([h1 >>> 0, h2 >>> 0]);
  }
  #getPath(nameOrURL) {
    const url = typeof nameOrURL === "string" ? new URL(nameOrURL, "file://localhost/") : nameOrURL;
    return url.pathname;
  }
  #deletePath(path) {
    const accessHandle = this.#mapPathToAccessHandle.get(path);
    if (accessHandle) {
      this.#mapPathToAccessHandle.delete(path);
      this.#setAssociatedPath(accessHandle, "", 0);
    }
  }
}

// src/web/wa-sqlite/MemoryVFS.js
class MemoryVFS extends FacadeVFS {
  mapNameToFile = new Map;
  mapIdToFile = new Map;
  static async create(name, module) {
    const vfs = new MemoryVFS(name, module);
    await vfs.isReady();
    return vfs;
  }
  constructor(name, module) {
    super(name, module);
  }
  close() {
    for (const fileId of this.mapIdToFile.keys()) {
      this.jClose(fileId);
    }
  }
  jOpen(filename, fileId, flags, pOutFlags) {
    const url = new URL(filename || Math.random().toString(36).slice(2), "file://");
    const pathname = url.pathname;
    let file = this.mapNameToFile.get(pathname);
    if (!file) {
      if (flags & SQLITE_OPEN_CREATE) {
        file = {
          pathname,
          flags,
          size: 0,
          data: new ArrayBuffer(0)
        };
        this.mapNameToFile.set(pathname, file);
      } else {
        return SQLITE_CANTOPEN;
      }
    }
    this.mapIdToFile.set(fileId, file);
    pOutFlags.setInt32(0, flags, true);
    return SQLITE_OK;
  }
  jClose(fileId) {
    const file = this.mapIdToFile.get(fileId);
    this.mapIdToFile.delete(fileId);
    if (file.flags & SQLITE_OPEN_DELETEONCLOSE) {
      this.mapNameToFile.delete(file.pathname);
    }
    return SQLITE_OK;
  }
  jRead(fileId, pData, iOffset) {
    const file = this.mapIdToFile.get(fileId);
    const bgn = Math.min(iOffset, file.size);
    const end = Math.min(iOffset + pData.byteLength, file.size);
    const nBytes = end - bgn;
    if (nBytes) {
      pData.set(new Uint8Array(file.data, bgn, nBytes));
    }
    if (nBytes < pData.byteLength) {
      pData.fill(0, nBytes);
      return SQLITE_IOERR_SHORT_READ;
    }
    return SQLITE_OK;
  }
  jWrite(fileId, pData, iOffset) {
    const file = this.mapIdToFile.get(fileId);
    if (iOffset + pData.byteLength > file.data.byteLength) {
      const newSize = Math.max(iOffset + pData.byteLength, 2 * file.data.byteLength);
      const data = new ArrayBuffer(newSize);
      new Uint8Array(data).set(new Uint8Array(file.data, 0, file.size));
      file.data = data;
    }
    new Uint8Array(file.data, iOffset, pData.byteLength).set(pData);
    file.size = Math.max(file.size, iOffset + pData.byteLength);
    return SQLITE_OK;
  }
  jTruncate(fileId, iSize) {
    const file = this.mapIdToFile.get(fileId);
    file.size = Math.min(file.size, iSize);
    return SQLITE_OK;
  }
  jFileSize(fileId, pSize64) {
    const file = this.mapIdToFile.get(fileId);
    pSize64.setBigInt64(0, BigInt(file.size), true);
    return SQLITE_OK;
  }
  jDelete(name, syncDir) {
    const url = new URL(name, "file://");
    const pathname = url.pathname;
    this.mapNameToFile.delete(pathname);
    return SQLITE_OK;
  }
  jAccess(name, flags, pResOut) {
    const url = new URL(name, "file://");
    const pathname = url.pathname;
    const file = this.mapNameToFile.get(pathname);
    pResOut.setInt32(0, file ? 1 : 0, true);
    return SQLITE_OK;
  }
}

// src/web/wa-sqlite/sqlite-api.js
var MAX_INT64 = 0x7fffffffffffffffn;
var MIN_INT64 = -0x8000000000000000n;
var AsyncFunction2 = Object.getPrototypeOf(async function() {
}).constructor;

class SQLiteError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}
var async = true;
function Factory(Module) {
  const sqlite3 = {};
  Module.retryOps = [];
  const sqliteFreeAddress = Module._getSqliteFree();
  const tmp = Module._malloc(8);
  const tmpPtr = [tmp, tmp + 4];
  function createUTF8(s) {
    if (typeof s !== "string")
      return 0;
    const utf8 = new TextEncoder().encode(s);
    const zts = Module._sqlite3_malloc(utf8.byteLength + 1);
    Module.HEAPU8.set(utf8, zts);
    Module.HEAPU8[zts + utf8.byteLength] = 0;
    return zts;
  }
  function cvt32x2ToBigInt(lo32, hi32) {
    return BigInt(hi32) << 32n | BigInt(lo32) & 0xffffffffn;
  }
  const cvt32x2AsSafe = function() {
    const hiMax = BigInt(Number.MAX_SAFE_INTEGER) >> 32n;
    const hiMin = BigInt(Number.MIN_SAFE_INTEGER) >> 32n;
    return function(lo32, hi32) {
      if (hi32 > hiMax || hi32 < hiMin) {
        return cvt32x2ToBigInt(lo32, hi32);
      } else {
        return hi32 * 4294967296 + (lo32 & 2147483647) - (lo32 & 2147483648);
      }
    };
  }();
  const databases = new Set;
  function verifyDatabase(db) {
    if (!databases.has(db)) {
      throw new SQLiteError("not a database", SQLITE_MISUSE);
    }
  }
  const mapStmtToDB = new Map;
  function verifyStatement(stmt) {
    if (!mapStmtToDB.has(stmt)) {
      throw new SQLiteError("not a statement", SQLITE_MISUSE);
    }
  }
  sqlite3.bind_collection = function(stmt, bindings) {
    verifyStatement(stmt);
    const isArray = Array.isArray(bindings);
    const nBindings = sqlite3.bind_parameter_count(stmt);
    for (let i = 1;i <= nBindings; ++i) {
      const key = isArray ? i - 1 : sqlite3.bind_parameter_name(stmt, i);
      const value = bindings[key];
      if (value !== undefined) {
        sqlite3.bind(stmt, i, value);
      }
    }
    return SQLITE_OK;
  };
  sqlite3.bind = function(stmt, i, value) {
    verifyStatement(stmt);
    switch (typeof value) {
      case "number":
        if (value === (value | 0)) {
          return sqlite3.bind_int(stmt, i, value);
        } else {
          return sqlite3.bind_double(stmt, i, value);
        }
      case "string":
        return sqlite3.bind_text(stmt, i, value);
      default:
        if (value instanceof Uint8Array || Array.isArray(value)) {
          return sqlite3.bind_blob(stmt, i, value);
        } else if (value === null) {
          return sqlite3.bind_null(stmt, i);
        } else if (typeof value === "bigint") {
          return sqlite3.bind_int64(stmt, i, value);
        } else if (value === undefined) {
          return SQLITE_NOTICE;
        } else {
          console.warn("unknown binding converted to null", value);
          return sqlite3.bind_null(stmt, i);
        }
    }
  };
  sqlite3.bind_blob = function() {
    const fname = "sqlite3_bind_blob";
    const f = Module.cwrap(fname, ...decl("nnnnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      const byteLength = value.byteLength ?? value.length;
      const ptr = Module._sqlite3_malloc(byteLength);
      Module.HEAPU8.subarray(ptr).set(value);
      const result = f(stmt, i, ptr, byteLength, sqliteFreeAddress);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_parameter_count = function() {
    const fname = "sqlite3_bind_parameter_count";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.bind_double = function() {
    const fname = "sqlite3_bind_double";
    const f = Module.cwrap(fname, ...decl("nnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      const result = f(stmt, i, value);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_int = function() {
    const fname = "sqlite3_bind_int";
    const f = Module.cwrap(fname, ...decl("nnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      if (value > 2147483647 || value < -2147483648)
        return SQLITE_RANGE;
      const result = f(stmt, i, value);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_int64 = function() {
    const fname = "sqlite3_bind_int64";
    const f = Module.cwrap(fname, ...decl("nnnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      if (value > MAX_INT64 || value < MIN_INT64)
        return SQLITE_RANGE;
      const lo32 = value & 0xffffffffn;
      const hi32 = value >> 32n;
      const result = f(stmt, i, Number(lo32), Number(hi32));
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_null = function() {
    const fname = "sqlite3_bind_null";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, i) {
      verifyStatement(stmt);
      const result = f(stmt, i);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.bind_parameter_index = function() {
    const fname = "sqlite3_bind_parameter_index";
    const f = Module.cwrap(fname, ...decl("ns:n"));
    return function(stmt, name) {
      verifyStatement(stmt);
      const result = f(stmt, name);
      return result;
    };
  }();
  sqlite3.bind_parameter_name = function() {
    const fname = "sqlite3_bind_parameter_name";
    const f = Module.cwrap(fname, ...decl("n:s"));
    return function(stmt, i) {
      verifyStatement(stmt);
      const result = f(stmt, i);
      return result;
    };
  }();
  sqlite3.bind_text = function() {
    const fname = "sqlite3_bind_text";
    const f = Module.cwrap(fname, ...decl("nnnnn:n"));
    return function(stmt, i, value) {
      verifyStatement(stmt);
      const ptr = createUTF8(value);
      const result = f(stmt, i, ptr, -1, sqliteFreeAddress);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.changes = function() {
    const fname = "sqlite3_changes";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(db) {
      verifyDatabase(db);
      const result = f(db);
      return result;
    };
  }();
  sqlite3.clear_bindings = function() {
    const fname = "sqlite3_clear_bindings";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.close = function() {
    const fname = "sqlite3_close";
    const f = Module.cwrap(fname, ...decl("n:n"), { async });
    return async function(db) {
      verifyDatabase(db);
      const result = await f(db);
      databases.delete(db);
      return check(fname, result, db);
    };
  }();
  sqlite3.column = function(stmt, iCol) {
    verifyStatement(stmt);
    const type = sqlite3.column_type(stmt, iCol);
    switch (type) {
      case SQLITE_BLOB:
        return sqlite3.column_blob(stmt, iCol);
      case SQLITE_FLOAT:
        return sqlite3.column_double(stmt, iCol);
      case SQLITE_INTEGER:
        const lo32 = sqlite3.column_int(stmt, iCol);
        const hi32 = Module.getTempRet0();
        return cvt32x2AsSafe(lo32, hi32);
      case SQLITE_NULL:
        return null;
      case SQLITE_TEXT:
        return sqlite3.column_text(stmt, iCol);
      default:
        throw new SQLiteError("unknown type", type);
    }
  };
  sqlite3.column_blob = function() {
    const fname = "sqlite3_column_blob";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const nBytes = sqlite3.column_bytes(stmt, iCol);
      const address = f(stmt, iCol);
      const result = Module.HEAPU8.subarray(address, address + nBytes);
      return result;
    };
  }();
  sqlite3.column_bytes = function() {
    const fname = "sqlite3_column_bytes";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_count = function() {
    const fname = "sqlite3_column_count";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.column_double = function() {
    const fname = "sqlite3_column_double";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_int = function() {
    const fname = "sqlite3_column_int64";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_int64 = function() {
    const fname = "sqlite3_column_int64";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const lo32 = f(stmt, iCol);
      const hi32 = Module.getTempRet0();
      const result = cvt32x2ToBigInt(lo32, hi32);
      return result;
    };
  }();
  sqlite3.column_name = function() {
    const fname = "sqlite3_column_name";
    const f = Module.cwrap(fname, ...decl("nn:s"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_names = function(stmt) {
    const columns = [];
    const nColumns = sqlite3.column_count(stmt);
    for (let i = 0;i < nColumns; ++i) {
      columns.push(sqlite3.column_name(stmt, i));
    }
    return columns;
  };
  sqlite3.column_text = function() {
    const fname = "sqlite3_column_text";
    const f = Module.cwrap(fname, ...decl("nn:s"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.column_type = function() {
    const fname = "sqlite3_column_type";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(stmt, iCol) {
      verifyStatement(stmt);
      const result = f(stmt, iCol);
      return result;
    };
  }();
  sqlite3.create_function = function(db, zFunctionName, nArg, eTextRep, pApp, xFunc, xStep, xFinal) {
    verifyDatabase(db);
    function adapt(f) {
      return f instanceof AsyncFunction2 ? async (ctx, n, values) => f(ctx, Module.HEAP32.subarray(values / 4, values / 4 + n)) : (ctx, n, values) => f(ctx, Module.HEAP32.subarray(values / 4, values / 4 + n));
    }
    const result = Module.create_function(db, zFunctionName, nArg, eTextRep, pApp, xFunc && adapt(xFunc), xStep && adapt(xStep), xFinal);
    return check("sqlite3_create_function", result, db);
  };
  sqlite3.data_count = function() {
    const fname = "sqlite3_data_count";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.deserialize = function() {
    const fname = "sqlite3_deserialize";
    const f = Module.cwrap(fname, ...decl("nsnnnn:n"));
    return function(db, schema, data) {
      const flags = SQLITE_DESERIALIZE_RESIZEABLE | SQLITE_DESERIALIZE_FREEONCLOSE;
      verifyDatabase(db);
      const size = data.byteLength;
      const ptr = Module._sqlite3_malloc(size);
      Module.HEAPU8.subarray(ptr).set(data);
      const result = f(db, schema, ptr, size, size, flags);
      return result;
    };
  }();
  sqlite3.exec = async function(db, sql, callback) {
    for await (const stmt of sqlite3.statements(db, sql)) {
      let columns;
      while (await sqlite3.step(stmt) === SQLITE_ROW) {
        if (callback) {
          columns = columns ?? sqlite3.column_names(stmt);
          const row = sqlite3.row(stmt);
          await callback(row, columns);
        }
      }
    }
    return SQLITE_OK;
  };
  sqlite3.finalize = function() {
    const fname = "sqlite3_finalize";
    const f = Module.cwrap(fname, ...decl("n:n"), { async });
    return async function(stmt) {
      const result = await f(stmt);
      mapStmtToDB.delete(stmt);
      return result;
    };
  }();
  sqlite3.get_autocommit = function() {
    const fname = "sqlite3_get_autocommit";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(db) {
      const result = f(db);
      return result;
    };
  }();
  sqlite3.last_insert_rowid = function() {
    const fname = "sqlite3_last_insert_rowid";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(db) {
      const lo32 = f(db);
      const hi32 = Module.getTempRet0();
      return cvt32x2AsSafe(lo32, hi32);
    };
  }();
  sqlite3.libversion = function() {
    const fname = "sqlite3_libversion";
    const f = Module.cwrap(fname, ...decl(":s"));
    return function() {
      const result = f();
      return result;
    };
  }();
  sqlite3.libversion_number = function() {
    const fname = "sqlite3_libversion_number";
    const f = Module.cwrap(fname, ...decl(":n"));
    return function() {
      const result = f();
      return result;
    };
  }();
  sqlite3.limit = function() {
    const fname = "sqlite3_limit";
    const f = Module.cwrap(fname, ...decl("nnn:n"));
    return function(db, id, newVal) {
      const result = f(db, id, newVal);
      return result;
    };
  }();
  sqlite3.next_stmt = function() {
    const fname = "sqlite3_next_stmt";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(db, stmt) {
      verifyDatabase(db);
      const result = f(db, stmt || 0);
      return result;
    };
  }();
  sqlite3.open_v2 = function() {
    const fname = "sqlite3_open_v2";
    const f = Module.cwrap(fname, ...decl("snnn:n"), { async });
    return async function(zFilename, flags, zVfs) {
      flags = flags || SQLITE_OPEN_CREATE | SQLITE_OPEN_READWRITE;
      zVfs = createUTF8(zVfs);
      try {
        const rc = await retry(() => f(zFilename, tmpPtr[0], flags, zVfs));
        const db = Module.getValue(tmpPtr[0], "*");
        databases.add(db);
        Module.ccall("RegisterExtensionFunctions", "void", ["number"], [db]);
        check(fname, rc);
        return db;
      } finally {
        Module._sqlite3_free(zVfs);
      }
    };
  }();
  sqlite3.progress_handler = function(db, nProgressOps, handler, userData) {
    verifyDatabase(db);
    Module.progress_handler(db, nProgressOps, handler, userData);
  };
  sqlite3.reset = function() {
    const fname = "sqlite3_reset";
    const f = Module.cwrap(fname, ...decl("n:n"), { async });
    return async function(stmt) {
      verifyStatement(stmt);
      const result = await f(stmt);
      return check(fname, result, mapStmtToDB.get(stmt));
    };
  }();
  sqlite3.result = function(context, value) {
    switch (typeof value) {
      case "number":
        if (value === (value | 0)) {
          sqlite3.result_int(context, value);
        } else {
          sqlite3.result_double(context, value);
        }
        break;
      case "string":
        sqlite3.result_text(context, value);
        break;
      default:
        if (value instanceof Uint8Array || Array.isArray(value)) {
          sqlite3.result_blob(context, value);
        } else if (value === null) {
          sqlite3.result_null(context);
        } else if (typeof value === "bigint") {
          return sqlite3.result_int64(context, value);
        } else {
          console.warn("unknown result converted to null", value);
          sqlite3.result_null(context);
        }
        break;
    }
  };
  sqlite3.result_blob = function() {
    const fname = "sqlite3_result_blob";
    const f = Module.cwrap(fname, ...decl("nnnn:n"));
    return function(context, value) {
      const byteLength = value.byteLength ?? value.length;
      const ptr = Module._sqlite3_malloc(byteLength);
      Module.HEAPU8.subarray(ptr).set(value);
      f(context, ptr, byteLength, sqliteFreeAddress);
    };
  }();
  sqlite3.result_double = function() {
    const fname = "sqlite3_result_double";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(context, value) {
      f(context, value);
    };
  }();
  sqlite3.result_int = function() {
    const fname = "sqlite3_result_int";
    const f = Module.cwrap(fname, ...decl("nn:n"));
    return function(context, value) {
      f(context, value);
    };
  }();
  sqlite3.result_int64 = function() {
    const fname = "sqlite3_result_int64";
    const f = Module.cwrap(fname, ...decl("nnn:n"));
    return function(context, value) {
      if (value > MAX_INT64 || value < MIN_INT64)
        return SQLITE_RANGE;
      const lo32 = value & 0xffffffffn;
      const hi32 = value >> 32n;
      f(context, Number(lo32), Number(hi32));
    };
  }();
  sqlite3.result_null = function() {
    const fname = "sqlite3_result_null";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(context) {
      f(context);
    };
  }();
  sqlite3.result_text = function() {
    const fname = "sqlite3_result_text";
    const f = Module.cwrap(fname, ...decl("nnnn:n"));
    return function(context, value) {
      const ptr = createUTF8(value);
      f(context, ptr, -1, sqliteFreeAddress);
    };
  }();
  sqlite3.row = function(stmt) {
    const row = [];
    const nColumns = sqlite3.data_count(stmt);
    for (let i = 0;i < nColumns; ++i) {
      const value = sqlite3.column(stmt, i);
      row.push(value?.buffer === Module.HEAPU8.buffer ? value.slice() : value);
    }
    return row;
  };
  sqlite3.serialize = function() {
    const fname = "sqlite3_serialize";
    const f = Module.cwrap(fname, ...decl("nsnn:n"));
    return function(db, schema) {
      verifyDatabase(db);
      const size = tmpPtr[0];
      const flags = 0;
      const ptr = f(db, schema, size, flags);
      if (!ptr) {
        return null;
      }
      const bufferSize = Module.getValue(size, "*");
      const buffer = Module.HEAPU8.subarray(ptr, ptr + bufferSize);
      const result = new Uint8Array(buffer);
      Module._sqlite3_free(ptr);
      return result;
    };
  }();
  sqlite3.set_authorizer = function(db, xAuth, pApp) {
    verifyDatabase(db);
    function cvtArgs(_, iAction, p3, p4, p5, p6) {
      return [
        _,
        iAction,
        Module.UTF8ToString(p3),
        Module.UTF8ToString(p4),
        Module.UTF8ToString(p5),
        Module.UTF8ToString(p6)
      ];
    }
    function adapt(f) {
      return f instanceof AsyncFunction2 ? async (_, iAction, p3, p4, p5, p6) => f(...cvtArgs(_, iAction, p3, p4, p5, p6)) : (_, iAction, p3, p4, p5, p6) => f(...cvtArgs(_, iAction, p3, p4, p5, p6));
    }
    const result = Module.set_authorizer(db, adapt(xAuth), pApp);
    return check("sqlite3_set_authorizer", result, db);
  };
  sqlite3.sql = function() {
    const fname = "sqlite3_sql";
    const f = Module.cwrap(fname, ...decl("n:s"));
    return function(stmt) {
      verifyStatement(stmt);
      const result = f(stmt);
      return result;
    };
  }();
  sqlite3.statements = function(db, sql, options = {}) {
    const prepare = Module.cwrap("sqlite3_prepare_v3", "number", ["number", "number", "number", "number", "number", "number"], { async: true });
    return async function* () {
      const onFinally = [];
      try {
        let maybeFinalize = function() {
          if (stmt && !options.unscoped) {
            sqlite3.finalize(stmt);
          }
          stmt = 0;
        };
        const utf8 = new TextEncoder().encode(sql);
        const allocSize = utf8.byteLength - utf8.byteLength % 4 + 12;
        const pzHead = Module._sqlite3_malloc(allocSize);
        const pzEnd = pzHead + utf8.byteLength + 1;
        onFinally.push(() => Module._sqlite3_free(pzHead));
        Module.HEAPU8.set(utf8, pzHead);
        Module.HEAPU8[pzEnd - 1] = 0;
        const pStmt = pzHead + allocSize - 8;
        const pzTail = pzHead + allocSize - 4;
        let stmt;
        onFinally.push(maybeFinalize);
        Module.setValue(pzTail, pzHead, "*");
        do {
          maybeFinalize();
          const zTail = Module.getValue(pzTail, "*");
          const rc = await retry(() => {
            return prepare(db, zTail, pzEnd - pzTail, options.flags || 0, pStmt, pzTail);
          });
          if (rc !== SQLITE_OK) {
            check("sqlite3_prepare_v3", rc, db);
          }
          stmt = Module.getValue(pStmt, "*");
          if (stmt) {
            mapStmtToDB.set(stmt, db);
            yield stmt;
          }
        } while (stmt);
      } finally {
        while (onFinally.length) {
          onFinally.pop()();
        }
      }
    }();
  };
  sqlite3.step = function() {
    const fname = "sqlite3_step";
    const f = Module.cwrap(fname, ...decl("n:n"), { async });
    return async function(stmt) {
      verifyStatement(stmt);
      const rc = await retry(() => f(stmt));
      return check(fname, rc, mapStmtToDB.get(stmt), [SQLITE_ROW, SQLITE_DONE]);
    };
  }();
  sqlite3.commit_hook = function(db, xCommitHook) {
    verifyDatabase(db);
    Module.commit_hook(db, xCommitHook);
  };
  sqlite3.update_hook = function(db, xUpdateHook) {
    verifyDatabase(db);
    function cvtArgs(iUpdateType, dbName, tblName, lo32, hi32) {
      return [
        iUpdateType,
        Module.UTF8ToString(dbName),
        Module.UTF8ToString(tblName),
        cvt32x2ToBigInt(lo32, hi32)
      ];
    }
    function adapt(f) {
      return f instanceof AsyncFunction2 ? async (iUpdateType, dbName, tblName, lo32, hi32) => f(...cvtArgs(iUpdateType, dbName, tblName, lo32, hi32)) : (iUpdateType, dbName, tblName, lo32, hi32) => f(...cvtArgs(iUpdateType, dbName, tblName, lo32, hi32));
    }
    Module.update_hook(db, adapt(xUpdateHook));
  };
  sqlite3.value = function(pValue) {
    const type = sqlite3.value_type(pValue);
    switch (type) {
      case SQLITE_BLOB:
        return sqlite3.value_blob(pValue);
      case SQLITE_FLOAT:
        return sqlite3.value_double(pValue);
      case SQLITE_INTEGER:
        const lo32 = sqlite3.value_int(pValue);
        const hi32 = Module.getTempRet0();
        return cvt32x2AsSafe(lo32, hi32);
      case SQLITE_NULL:
        return null;
      case SQLITE_TEXT:
        return sqlite3.value_text(pValue);
      default:
        throw new SQLiteError("unknown type", type);
    }
  };
  sqlite3.value_blob = function() {
    const fname = "sqlite3_value_blob";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const nBytes = sqlite3.value_bytes(pValue);
      const address = f(pValue);
      const result = Module.HEAPU8.subarray(address, address + nBytes);
      return result;
    };
  }();
  sqlite3.value_bytes = function() {
    const fname = "sqlite3_value_bytes";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_double = function() {
    const fname = "sqlite3_value_double";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_int = function() {
    const fname = "sqlite3_value_int64";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_int64 = function() {
    const fname = "sqlite3_value_int64";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const lo32 = f(pValue);
      const hi32 = Module.getTempRet0();
      const result = cvt32x2ToBigInt(lo32, hi32);
      return result;
    };
  }();
  sqlite3.value_text = function() {
    const fname = "sqlite3_value_text";
    const f = Module.cwrap(fname, ...decl("n:s"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.value_type = function() {
    const fname = "sqlite3_value_type";
    const f = Module.cwrap(fname, ...decl("n:n"));
    return function(pValue) {
      const result = f(pValue);
      return result;
    };
  }();
  sqlite3.vfs_register = function(vfs, makeDefault) {
    const result = Module.vfs_register(vfs, makeDefault);
    return check("sqlite3_vfs_register", result);
  };
  function check(fname, result, db = null, allowed = [SQLITE_OK]) {
    if (allowed.includes(result))
      return result;
    let message;
    if (db) {
      const errcode = Module.ccall("sqlite3_errcode", "number", ["number"], [db]);
      const errmsg = Module.ccall("sqlite3_errmsg", "string", ["number"], [db]);
      message = "Error code " + errcode + ": " + errmsg;
    } else {
      message = fname;
    }
    throw new SQLiteError(message, result);
  }
  async function retry(f) {
    let rc;
    do {
      if (Module.retryOps.length) {
        await Promise.all(Module.retryOps);
        Module.retryOps = [];
      }
      rc = await f();
    } while (rc && Module.retryOps.length);
    return rc;
  }
  return sqlite3;
}
function decl(s) {
  const result = [];
  const m = s.match(/([ns@]*):([nsv@])/);
  switch (m[2]) {
    case "n":
      result.push("number");
      break;
    case "s":
      result.push("string");
      break;
    case "v":
      result.push(null);
      break;
  }
  const args = [];
  for (let c of m[1]) {
    switch (c) {
      case "n":
        args.push("number");
        break;
      case "s":
        args.push("string");
        break;
    }
  }
  result.push(args);
  return result;
}

// src/web/wa-sqlite/wa-sqlite-async.mjs
var Module = (() => {
  var _scriptName = import.meta.url;
  return async function(moduleArg = {}) {
    var moduleRtn;
    var Module2 = moduleArg;
    var readyPromiseResolve, readyPromiseReject;
    var readyPromise = new Promise((resolve, reject) => {
      readyPromiseResolve = resolve;
      readyPromiseReject = reject;
    });
    var ENVIRONMENT_IS_WEB = typeof window == "object";
    var ENVIRONMENT_IS_WORKER = typeof WorkerGlobalScope != "undefined";
    var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string" && process.type != "renderer";
    var moduleOverrides = Object.assign({}, Module2);
    var arguments_ = [];
    var thisProgram = "./this.program";
    var quit_ = (status, toThrow) => {
      throw toThrow;
    };
    var scriptDirectory = "";
    function locateFile(path) {
      if (Module2["locateFile"]) {
        return Module2["locateFile"](path, scriptDirectory);
      }
      return scriptDirectory + path;
    }
    var readAsync, readBinary;
    if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
      if (ENVIRONMENT_IS_WORKER) {
        scriptDirectory = self.location.href;
      } else if (typeof document != "undefined" && document.currentScript) {
        scriptDirectory = document.currentScript.src;
      }
      if (_scriptName) {
        scriptDirectory = _scriptName;
      }
      if (scriptDirectory.startsWith("blob:")) {
        scriptDirectory = "";
      } else {
        scriptDirectory = scriptDirectory.substr(0, scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1);
      }
      {
        if (ENVIRONMENT_IS_WORKER) {
          readBinary = (url) => {
            var xhr = new XMLHttpRequest;
            xhr.open("GET", url, false);
            xhr.responseType = "arraybuffer";
            xhr.send(null);
            return new Uint8Array(xhr.response);
          };
        }
        readAsync = async (url) => {
          var response = await fetch(url, { credentials: "same-origin" });
          if (response.ok) {
            return response.arrayBuffer();
          }
          throw new Error(response.status + " : " + response.url);
        };
      }
    } else {
    }
    var out = Module2["print"] || console.log.bind(console);
    var err = Module2["printErr"] || console.error.bind(console);
    Object.assign(Module2, moduleOverrides);
    moduleOverrides = null;
    if (Module2["arguments"])
      arguments_ = Module2["arguments"];
    if (Module2["thisProgram"])
      thisProgram = Module2["thisProgram"];
    var wasmBinary = Module2["wasmBinary"];
    var wasmMemory;
    var ABORT = false;
    var EXITSTATUS;
    var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
    var runtimeInitialized = false;
    var dataURIPrefix = "data:application/octet-stream;base64,";
    var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
    function updateMemoryViews() {
      var b = wasmMemory.buffer;
      Module2["HEAP8"] = HEAP8 = new Int8Array(b);
      Module2["HEAP16"] = HEAP16 = new Int16Array(b);
      Module2["HEAPU8"] = HEAPU8 = new Uint8Array(b);
      Module2["HEAPU16"] = HEAPU16 = new Uint16Array(b);
      Module2["HEAP32"] = HEAP32 = new Int32Array(b);
      Module2["HEAPU32"] = HEAPU32 = new Uint32Array(b);
      Module2["HEAPF32"] = HEAPF32 = new Float32Array(b);
      Module2["HEAPF64"] = HEAPF64 = new Float64Array(b);
    }
    var __ATPRERUN__ = [];
    var __ATINIT__ = [];
    var __ATMAIN__ = [];
    var __ATPOSTRUN__ = [];
    function preRun() {
      if (Module2["preRun"]) {
        if (typeof Module2["preRun"] == "function")
          Module2["preRun"] = [Module2["preRun"]];
        while (Module2["preRun"].length) {
          addOnPreRun(Module2["preRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPRERUN__);
    }
    function initRuntime() {
      runtimeInitialized = true;
      if (!Module2["noFSInit"] && !FS.initialized)
        FS.init();
      FS.ignorePermissions = false;
      TTY.init();
      callRuntimeCallbacks(__ATINIT__);
    }
    function preMain() {
      callRuntimeCallbacks(__ATMAIN__);
    }
    function postRun() {
      if (Module2["postRun"]) {
        if (typeof Module2["postRun"] == "function")
          Module2["postRun"] = [Module2["postRun"]];
        while (Module2["postRun"].length) {
          addOnPostRun(Module2["postRun"].shift());
        }
      }
      callRuntimeCallbacks(__ATPOSTRUN__);
    }
    function addOnPreRun(cb) {
      __ATPRERUN__.unshift(cb);
    }
    function addOnInit(cb) {
      __ATINIT__.unshift(cb);
    }
    function addOnPostRun(cb) {
      __ATPOSTRUN__.unshift(cb);
    }
    var runDependencies = 0;
    var dependenciesFulfilled = null;
    function getUniqueRunDependency(id) {
      return id;
    }
    function addRunDependency(id) {
      runDependencies++;
      Module2["monitorRunDependencies"]?.(runDependencies);
    }
    function removeRunDependency(id) {
      runDependencies--;
      Module2["monitorRunDependencies"]?.(runDependencies);
      if (runDependencies == 0) {
        if (dependenciesFulfilled) {
          var callback = dependenciesFulfilled;
          dependenciesFulfilled = null;
          callback();
        }
      }
    }
    function abort(what) {
      Module2["onAbort"]?.(what);
      what = "Aborted(" + what + ")";
      err(what);
      ABORT = true;
      what += ". Build with -sASSERTIONS for more info.";
      var e = new WebAssembly.RuntimeError(what);
      readyPromiseReject(e);
      throw e;
    }
    var wasmBinaryFile;
    function findWasmBinary() {
      if (Module2["locateFile"]) {
        var f = "wa-sqlite-async.wasm";
        if (!isDataURI(f)) {
          return locateFile(f);
        }
        return f;
      }
      return new URL("wa-sqlite-async.wasm", import.meta.url).href;
    }
    function getBinarySync(file) {
      if (file == wasmBinaryFile && wasmBinary) {
        return new Uint8Array(wasmBinary);
      }
      if (readBinary) {
        return readBinary(file);
      }
      throw "both async and sync fetching of the wasm failed";
    }
    async function getWasmBinary(binaryFile) {
      if (!wasmBinary) {
        try {
          var response = await readAsync(binaryFile);
          return new Uint8Array(response);
        } catch {
        }
      }
      return getBinarySync(binaryFile);
    }
    async function instantiateArrayBuffer(binaryFile, imports) {
      try {
        var binary = await getWasmBinary(binaryFile);
        var instance = await WebAssembly.instantiate(binary, imports);
        return instance;
      } catch (reason) {
        err(`failed to asynchronously prepare wasm: ${reason}`);
        abort(reason);
      }
    }
    async function instantiateAsync(binary, binaryFile, imports) {
      if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile)) {
        try {
          var response = fetch(binaryFile, { credentials: "same-origin" });
          var instantiationResult = await WebAssembly.instantiateStreaming(response, imports);
          return instantiationResult;
        } catch (reason) {
          err(`wasm streaming compile failed: ${reason}`);
          err("falling back to ArrayBuffer instantiation");
        }
      }
      return instantiateArrayBuffer(binaryFile, imports);
    }
    function getWasmImports() {
      return { a: wasmImports };
    }
    async function createWasm() {
      function receiveInstance(instance, module) {
        wasmExports = instance.exports;
        wasmExports = Asyncify.instrumentWasmExports(wasmExports);
        wasmMemory = wasmExports["pa"];
        updateMemoryViews();
        wasmTable = wasmExports["jf"];
        addOnInit(wasmExports["qa"]);
        removeRunDependency("wasm-instantiate");
        return wasmExports;
      }
      addRunDependency("wasm-instantiate");
      function receiveInstantiationResult(result2) {
        return receiveInstance(result2["instance"]);
      }
      var info = getWasmImports();
      if (Module2["instantiateWasm"]) {
        try {
          return Module2["instantiateWasm"](info, receiveInstance);
        } catch (e) {
          err(`Module.instantiateWasm callback failed with error: ${e}`);
          readyPromiseReject(e);
        }
      }
      wasmBinaryFile ??= findWasmBinary();
      try {
        var result = await instantiateAsync(wasmBinary, wasmBinaryFile, info);
        var exports = receiveInstantiationResult(result);
        return exports;
      } catch (e) {
        readyPromiseReject(e);
        return Promise.reject(e);
      }
    }
    var tempDouble;
    var tempI64;

    class ExitStatus {
      name = "ExitStatus";
      constructor(status) {
        this.message = `Program terminated with exit(${status})`;
        this.status = status;
      }
    }
    var callRuntimeCallbacks = (callbacks) => {
      while (callbacks.length > 0) {
        callbacks.shift()(Module2);
      }
    };
    function getValue(ptr, type = "i8") {
      if (type.endsWith("*"))
        type = "*";
      switch (type) {
        case "i1":
          return HEAP8[ptr];
        case "i8":
          return HEAP8[ptr];
        case "i16":
          return HEAP16[ptr >> 1];
        case "i32":
          return HEAP32[ptr >> 2];
        case "i64":
          abort("to do getValue(i64) use WASM_BIGINT");
        case "float":
          return HEAPF32[ptr >> 2];
        case "double":
          return HEAPF64[ptr >> 3];
        case "*":
          return HEAPU32[ptr >> 2];
        default:
          abort(`invalid type for getValue: ${type}`);
      }
    }
    var noExitRuntime = Module2["noExitRuntime"] || true;
    function setValue(ptr, value, type = "i8") {
      if (type.endsWith("*"))
        type = "*";
      switch (type) {
        case "i1":
          HEAP8[ptr] = value;
          break;
        case "i8":
          HEAP8[ptr] = value;
          break;
        case "i16":
          HEAP16[ptr >> 1] = value;
          break;
        case "i32":
          HEAP32[ptr >> 2] = value;
          break;
        case "i64":
          abort("to do setValue(i64) use WASM_BIGINT");
        case "float":
          HEAPF32[ptr >> 2] = value;
          break;
        case "double":
          HEAPF64[ptr >> 3] = value;
          break;
        case "*":
          HEAPU32[ptr >> 2] = value;
          break;
        default:
          abort(`invalid type for setValue: ${type}`);
      }
    }
    var stackRestore = (val) => __emscripten_stack_restore(val);
    var stackSave = () => _emscripten_stack_get_current();
    var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder : undefined;
    var UTF8ArrayToString = (heapOrArray, idx = 0, maxBytesToRead = NaN) => {
      var endIdx = idx + maxBytesToRead;
      var endPtr = idx;
      while (heapOrArray[endPtr] && !(endPtr >= endIdx))
        ++endPtr;
      if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
        return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
      }
      var str = "";
      while (idx < endPtr) {
        var u0 = heapOrArray[idx++];
        if (!(u0 & 128)) {
          str += String.fromCharCode(u0);
          continue;
        }
        var u1 = heapOrArray[idx++] & 63;
        if ((u0 & 224) == 192) {
          str += String.fromCharCode((u0 & 31) << 6 | u1);
          continue;
        }
        var u2 = heapOrArray[idx++] & 63;
        if ((u0 & 240) == 224) {
          u0 = (u0 & 15) << 12 | u1 << 6 | u2;
        } else {
          u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
        }
        if (u0 < 65536) {
          str += String.fromCharCode(u0);
        } else {
          var ch = u0 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        }
      }
      return str;
    };
    var UTF8ToString = (ptr, maxBytesToRead) => ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
    var ___assert_fail = (condition, filename, line, func) => abort(`Assertion failed: ${UTF8ToString(condition)}, at: ` + [filename ? UTF8ToString(filename) : "unknown filename", line, func ? UTF8ToString(func) : "unknown function"]);
    var PATH = { isAbs: (path) => path.charAt(0) === "/", splitPath: (filename) => {
      var splitPathRe = /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
      return splitPathRe.exec(filename).slice(1);
    }, normalizeArray: (parts, allowAboveRoot) => {
      var up = 0;
      for (var i = parts.length - 1;i >= 0; i--) {
        var last = parts[i];
        if (last === ".") {
          parts.splice(i, 1);
        } else if (last === "..") {
          parts.splice(i, 1);
          up++;
        } else if (up) {
          parts.splice(i, 1);
          up--;
        }
      }
      if (allowAboveRoot) {
        for (;up; up--) {
          parts.unshift("..");
        }
      }
      return parts;
    }, normalize: (path) => {
      var isAbsolute = PATH.isAbs(path), trailingSlash = path.substr(-1) === "/";
      path = PATH.normalizeArray(path.split("/").filter((p) => !!p), !isAbsolute).join("/");
      if (!path && !isAbsolute) {
        path = ".";
      }
      if (path && trailingSlash) {
        path += "/";
      }
      return (isAbsolute ? "/" : "") + path;
    }, dirname: (path) => {
      var result = PATH.splitPath(path), root = result[0], dir = result[1];
      if (!root && !dir) {
        return ".";
      }
      if (dir) {
        dir = dir.substr(0, dir.length - 1);
      }
      return root + dir;
    }, basename: (path) => path && path.match(/([^\/]+|\/)\/*$/)[1], join: (...paths) => PATH.normalize(paths.join("/")), join2: (l, r) => PATH.normalize(l + "/" + r) };
    var initRandomFill = () => (view) => crypto.getRandomValues(view);
    var randomFill = (view) => {
      (randomFill = initRandomFill())(view);
    };
    var PATH_FS = { resolve: (...args) => {
      var resolvedPath = "", resolvedAbsolute = false;
      for (var i = args.length - 1;i >= -1 && !resolvedAbsolute; i--) {
        var path = i >= 0 ? args[i] : FS.cwd();
        if (typeof path != "string") {
          throw new TypeError("Arguments to path.resolve must be strings");
        } else if (!path) {
          return "";
        }
        resolvedPath = path + "/" + resolvedPath;
        resolvedAbsolute = PATH.isAbs(path);
      }
      resolvedPath = PATH.normalizeArray(resolvedPath.split("/").filter((p) => !!p), !resolvedAbsolute).join("/");
      return (resolvedAbsolute ? "/" : "") + resolvedPath || ".";
    }, relative: (from, to) => {
      from = PATH_FS.resolve(from).substr(1);
      to = PATH_FS.resolve(to).substr(1);
      function trim(arr) {
        var start = 0;
        for (;start < arr.length; start++) {
          if (arr[start] !== "")
            break;
        }
        var end = arr.length - 1;
        for (;end >= 0; end--) {
          if (arr[end] !== "")
            break;
        }
        if (start > end)
          return [];
        return arr.slice(start, end - start + 1);
      }
      var fromParts = trim(from.split("/"));
      var toParts = trim(to.split("/"));
      var length = Math.min(fromParts.length, toParts.length);
      var samePartsLength = length;
      for (var i = 0;i < length; i++) {
        if (fromParts[i] !== toParts[i]) {
          samePartsLength = i;
          break;
        }
      }
      var outputParts = [];
      for (var i = samePartsLength;i < fromParts.length; i++) {
        outputParts.push("..");
      }
      outputParts = outputParts.concat(toParts.slice(samePartsLength));
      return outputParts.join("/");
    } };
    var FS_stdin_getChar_buffer = [];
    var lengthBytesUTF8 = (str) => {
      var len = 0;
      for (var i = 0;i < str.length; ++i) {
        var c = str.charCodeAt(i);
        if (c <= 127) {
          len++;
        } else if (c <= 2047) {
          len += 2;
        } else if (c >= 55296 && c <= 57343) {
          len += 4;
          ++i;
        } else {
          len += 3;
        }
      }
      return len;
    };
    var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
      if (!(maxBytesToWrite > 0))
        return 0;
      var startIdx = outIdx;
      var endIdx = outIdx + maxBytesToWrite - 1;
      for (var i = 0;i < str.length; ++i) {
        var u = str.charCodeAt(i);
        if (u >= 55296 && u <= 57343) {
          var u1 = str.charCodeAt(++i);
          u = 65536 + ((u & 1023) << 10) | u1 & 1023;
        }
        if (u <= 127) {
          if (outIdx >= endIdx)
            break;
          heap[outIdx++] = u;
        } else if (u <= 2047) {
          if (outIdx + 1 >= endIdx)
            break;
          heap[outIdx++] = 192 | u >> 6;
          heap[outIdx++] = 128 | u & 63;
        } else if (u <= 65535) {
          if (outIdx + 2 >= endIdx)
            break;
          heap[outIdx++] = 224 | u >> 12;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        } else {
          if (outIdx + 3 >= endIdx)
            break;
          heap[outIdx++] = 240 | u >> 18;
          heap[outIdx++] = 128 | u >> 12 & 63;
          heap[outIdx++] = 128 | u >> 6 & 63;
          heap[outIdx++] = 128 | u & 63;
        }
      }
      heap[outIdx] = 0;
      return outIdx - startIdx;
    };
    function intArrayFromString(stringy, dontAddNull, length) {
      var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
      var u8array = new Array(len);
      var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
      if (dontAddNull)
        u8array.length = numBytesWritten;
      return u8array;
    }
    var FS_stdin_getChar = () => {
      if (!FS_stdin_getChar_buffer.length) {
        var result = null;
        if (typeof window != "undefined" && typeof window.prompt == "function") {
          result = window.prompt("Input: ");
          if (result !== null) {
            result += `
`;
          }
        } else {
        }
        if (!result) {
          return null;
        }
        FS_stdin_getChar_buffer = intArrayFromString(result, true);
      }
      return FS_stdin_getChar_buffer.shift();
    };
    var TTY = { ttys: [], init() {
    }, shutdown() {
    }, register(dev, ops) {
      TTY.ttys[dev] = { input: [], output: [], ops };
      FS.registerDevice(dev, TTY.stream_ops);
    }, stream_ops: { open(stream) {
      var tty = TTY.ttys[stream.node.rdev];
      if (!tty) {
        throw new FS.ErrnoError(43);
      }
      stream.tty = tty;
      stream.seekable = false;
    }, close(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, fsync(stream) {
      stream.tty.ops.fsync(stream.tty);
    }, read(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.get_char) {
        throw new FS.ErrnoError(60);
      }
      var bytesRead = 0;
      for (var i = 0;i < length; i++) {
        var result;
        try {
          result = stream.tty.ops.get_char(stream.tty);
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
        if (result === undefined && bytesRead === 0) {
          throw new FS.ErrnoError(6);
        }
        if (result === null || result === undefined)
          break;
        bytesRead++;
        buffer[offset + i] = result;
      }
      if (bytesRead) {
        stream.node.atime = Date.now();
      }
      return bytesRead;
    }, write(stream, buffer, offset, length, pos) {
      if (!stream.tty || !stream.tty.ops.put_char) {
        throw new FS.ErrnoError(60);
      }
      try {
        for (var i = 0;i < length; i++) {
          stream.tty.ops.put_char(stream.tty, buffer[offset + i]);
        }
      } catch (e) {
        throw new FS.ErrnoError(29);
      }
      if (length) {
        stream.node.mtime = stream.node.ctime = Date.now();
      }
      return i;
    } }, default_tty_ops: { get_char(tty) {
      return FS_stdin_getChar();
    }, put_char(tty, val) {
      if (val === null || val === 10) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        out(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    }, ioctl_tcgets(tty) {
      return { c_iflag: 25856, c_oflag: 5, c_cflag: 191, c_lflag: 35387, c_cc: [3, 28, 127, 21, 4, 0, 1, 0, 17, 19, 26, 0, 18, 15, 23, 22, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] };
    }, ioctl_tcsets(tty, optional_actions, data) {
      return 0;
    }, ioctl_tiocgwinsz(tty) {
      return [24, 80];
    } }, default_tty1_ops: { put_char(tty, val) {
      if (val === null || val === 10) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      } else {
        if (val != 0)
          tty.output.push(val);
      }
    }, fsync(tty) {
      if (tty.output && tty.output.length > 0) {
        err(UTF8ArrayToString(tty.output));
        tty.output = [];
      }
    } } };
    var zeroMemory = (address, size) => {
      HEAPU8.fill(0, address, address + size);
    };
    var alignMemory = (size, alignment) => Math.ceil(size / alignment) * alignment;
    var mmapAlloc = (size) => {
      size = alignMemory(size, 65536);
      var ptr = _emscripten_builtin_memalign(65536, size);
      if (ptr)
        zeroMemory(ptr, size);
      return ptr;
    };
    var MEMFS = { ops_table: null, mount(mount) {
      return MEMFS.createNode(null, "/", 16895, 0);
    }, createNode(parent, name, mode, dev) {
      if (FS.isBlkdev(mode) || FS.isFIFO(mode)) {
        throw new FS.ErrnoError(63);
      }
      MEMFS.ops_table ||= { dir: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, lookup: MEMFS.node_ops.lookup, mknod: MEMFS.node_ops.mknod, rename: MEMFS.node_ops.rename, unlink: MEMFS.node_ops.unlink, rmdir: MEMFS.node_ops.rmdir, readdir: MEMFS.node_ops.readdir, symlink: MEMFS.node_ops.symlink }, stream: { llseek: MEMFS.stream_ops.llseek } }, file: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: { llseek: MEMFS.stream_ops.llseek, read: MEMFS.stream_ops.read, write: MEMFS.stream_ops.write, allocate: MEMFS.stream_ops.allocate, mmap: MEMFS.stream_ops.mmap, msync: MEMFS.stream_ops.msync } }, link: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr, readlink: MEMFS.node_ops.readlink }, stream: {} }, chrdev: { node: { getattr: MEMFS.node_ops.getattr, setattr: MEMFS.node_ops.setattr }, stream: FS.chrdev_stream_ops } };
      var node = FS.createNode(parent, name, mode, dev);
      if (FS.isDir(node.mode)) {
        node.node_ops = MEMFS.ops_table.dir.node;
        node.stream_ops = MEMFS.ops_table.dir.stream;
        node.contents = {};
      } else if (FS.isFile(node.mode)) {
        node.node_ops = MEMFS.ops_table.file.node;
        node.stream_ops = MEMFS.ops_table.file.stream;
        node.usedBytes = 0;
        node.contents = null;
      } else if (FS.isLink(node.mode)) {
        node.node_ops = MEMFS.ops_table.link.node;
        node.stream_ops = MEMFS.ops_table.link.stream;
      } else if (FS.isChrdev(node.mode)) {
        node.node_ops = MEMFS.ops_table.chrdev.node;
        node.stream_ops = MEMFS.ops_table.chrdev.stream;
      }
      node.atime = node.mtime = node.ctime = Date.now();
      if (parent) {
        parent.contents[name] = node;
        parent.atime = parent.mtime = parent.ctime = node.atime;
      }
      return node;
    }, getFileDataAsTypedArray(node) {
      if (!node.contents)
        return new Uint8Array(0);
      if (node.contents.subarray)
        return node.contents.subarray(0, node.usedBytes);
      return new Uint8Array(node.contents);
    }, expandFileStorage(node, newCapacity) {
      var prevCapacity = node.contents ? node.contents.length : 0;
      if (prevCapacity >= newCapacity)
        return;
      var CAPACITY_DOUBLING_MAX = 1024 * 1024;
      newCapacity = Math.max(newCapacity, prevCapacity * (prevCapacity < CAPACITY_DOUBLING_MAX ? 2 : 1.125) >>> 0);
      if (prevCapacity != 0)
        newCapacity = Math.max(newCapacity, 256);
      var oldContents = node.contents;
      node.contents = new Uint8Array(newCapacity);
      if (node.usedBytes > 0)
        node.contents.set(oldContents.subarray(0, node.usedBytes), 0);
    }, resizeFileStorage(node, newSize) {
      if (node.usedBytes == newSize)
        return;
      if (newSize == 0) {
        node.contents = null;
        node.usedBytes = 0;
      } else {
        var oldContents = node.contents;
        node.contents = new Uint8Array(newSize);
        if (oldContents) {
          node.contents.set(oldContents.subarray(0, Math.min(newSize, node.usedBytes)));
        }
        node.usedBytes = newSize;
      }
    }, node_ops: { getattr(node) {
      var attr = {};
      attr.dev = FS.isChrdev(node.mode) ? node.id : 1;
      attr.ino = node.id;
      attr.mode = node.mode;
      attr.nlink = 1;
      attr.uid = 0;
      attr.gid = 0;
      attr.rdev = node.rdev;
      if (FS.isDir(node.mode)) {
        attr.size = 4096;
      } else if (FS.isFile(node.mode)) {
        attr.size = node.usedBytes;
      } else if (FS.isLink(node.mode)) {
        attr.size = node.link.length;
      } else {
        attr.size = 0;
      }
      attr.atime = new Date(node.atime);
      attr.mtime = new Date(node.mtime);
      attr.ctime = new Date(node.ctime);
      attr.blksize = 4096;
      attr.blocks = Math.ceil(attr.size / attr.blksize);
      return attr;
    }, setattr(node, attr) {
      for (const key of ["mode", "atime", "mtime", "ctime"]) {
        if (attr[key] != null) {
          node[key] = attr[key];
        }
      }
      if (attr.size !== undefined) {
        MEMFS.resizeFileStorage(node, attr.size);
      }
    }, lookup(parent, name) {
      throw MEMFS.doesNotExistError;
    }, mknod(parent, name, mode, dev) {
      return MEMFS.createNode(parent, name, mode, dev);
    }, rename(old_node, new_dir, new_name) {
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (new_node) {
        if (FS.isDir(old_node.mode)) {
          for (var i in new_node.contents) {
            throw new FS.ErrnoError(55);
          }
        }
        FS.hashRemoveNode(new_node);
      }
      delete old_node.parent.contents[old_node.name];
      new_dir.contents[new_name] = old_node;
      old_node.name = new_name;
      new_dir.ctime = new_dir.mtime = old_node.parent.ctime = old_node.parent.mtime = Date.now();
    }, unlink(parent, name) {
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    }, rmdir(parent, name) {
      var node = FS.lookupNode(parent, name);
      for (var i in node.contents) {
        throw new FS.ErrnoError(55);
      }
      delete parent.contents[name];
      parent.ctime = parent.mtime = Date.now();
    }, readdir(node) {
      return [".", "..", ...Object.keys(node.contents)];
    }, symlink(parent, newname, oldpath) {
      var node = MEMFS.createNode(parent, newname, 511 | 40960, 0);
      node.link = oldpath;
      return node;
    }, readlink(node) {
      if (!FS.isLink(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      return node.link;
    } }, stream_ops: { read(stream, buffer, offset, length, position) {
      var contents = stream.node.contents;
      if (position >= stream.node.usedBytes)
        return 0;
      var size = Math.min(stream.node.usedBytes - position, length);
      if (size > 8 && contents.subarray) {
        buffer.set(contents.subarray(position, position + size), offset);
      } else {
        for (var i = 0;i < size; i++)
          buffer[offset + i] = contents[position + i];
      }
      return size;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (buffer.buffer === HEAP8.buffer) {
        canOwn = false;
      }
      if (!length)
        return 0;
      var node = stream.node;
      node.mtime = node.ctime = Date.now();
      if (buffer.subarray && (!node.contents || node.contents.subarray)) {
        if (canOwn) {
          node.contents = buffer.subarray(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (node.usedBytes === 0 && position === 0) {
          node.contents = buffer.slice(offset, offset + length);
          node.usedBytes = length;
          return length;
        } else if (position + length <= node.usedBytes) {
          node.contents.set(buffer.subarray(offset, offset + length), position);
          return length;
        }
      }
      MEMFS.expandFileStorage(node, position + length);
      if (node.contents.subarray && buffer.subarray) {
        node.contents.set(buffer.subarray(offset, offset + length), position);
      } else {
        for (var i = 0;i < length; i++) {
          node.contents[position + i] = buffer[offset + i];
        }
      }
      node.usedBytes = Math.max(node.usedBytes, position + length);
      return length;
    }, llseek(stream, offset, whence) {
      var position = offset;
      if (whence === 1) {
        position += stream.position;
      } else if (whence === 2) {
        if (FS.isFile(stream.node.mode)) {
          position += stream.node.usedBytes;
        }
      }
      if (position < 0) {
        throw new FS.ErrnoError(28);
      }
      return position;
    }, allocate(stream, offset, length) {
      MEMFS.expandFileStorage(stream.node, offset + length);
      stream.node.usedBytes = Math.max(stream.node.usedBytes, offset + length);
    }, mmap(stream, length, position, prot, flags) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      var ptr;
      var allocated;
      var contents = stream.node.contents;
      if (!(flags & 2) && contents && contents.buffer === HEAP8.buffer) {
        allocated = false;
        ptr = contents.byteOffset;
      } else {
        allocated = true;
        ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        if (contents) {
          if (position > 0 || position + length < contents.length) {
            if (contents.subarray) {
              contents = contents.subarray(position, position + length);
            } else {
              contents = Array.prototype.slice.call(contents, position, position + length);
            }
          }
          HEAP8.set(contents, ptr);
        }
      }
      return { ptr, allocated };
    }, msync(stream, buffer, offset, length, mmapFlags) {
      MEMFS.stream_ops.write(stream, buffer, 0, length, offset, false);
      return 0;
    } } };
    var asyncLoad = async (url) => {
      var arrayBuffer = await readAsync(url);
      return new Uint8Array(arrayBuffer);
    };
    asyncLoad.isAsync = true;
    var FS_createDataFile = (parent, name, fileData, canRead, canWrite, canOwn) => {
      FS.createDataFile(parent, name, fileData, canRead, canWrite, canOwn);
    };
    var preloadPlugins = Module2["preloadPlugins"] || [];
    var FS_handledByPreloadPlugin = (byteArray, fullname, finish, onerror) => {
      if (typeof Browser != "undefined")
        Browser.init();
      var handled = false;
      preloadPlugins.forEach((plugin) => {
        if (handled)
          return;
        if (plugin["canHandle"](fullname)) {
          plugin["handle"](byteArray, fullname, finish, onerror);
          handled = true;
        }
      });
      return handled;
    };
    var FS_createPreloadedFile = (parent, name, url, canRead, canWrite, onload, onerror, dontCreateFile, canOwn, preFinish) => {
      var fullname = name ? PATH_FS.resolve(PATH.join2(parent, name)) : parent;
      var dep = getUniqueRunDependency(`cp ${fullname}`);
      function processData(byteArray) {
        function finish(byteArray2) {
          preFinish?.();
          if (!dontCreateFile) {
            FS_createDataFile(parent, name, byteArray2, canRead, canWrite, canOwn);
          }
          onload?.();
          removeRunDependency(dep);
        }
        if (FS_handledByPreloadPlugin(byteArray, fullname, finish, () => {
          onerror?.();
          removeRunDependency(dep);
        })) {
          return;
        }
        finish(byteArray);
      }
      addRunDependency(dep);
      if (typeof url == "string") {
        asyncLoad(url).then(processData, onerror);
      } else {
        processData(url);
      }
    };
    var FS_modeStringToFlags = (str) => {
      var flagModes = { r: 0, "r+": 2, w: 512 | 64 | 1, "w+": 512 | 64 | 2, a: 1024 | 64 | 1, "a+": 1024 | 64 | 2 };
      var flags = flagModes[str];
      if (typeof flags == "undefined") {
        throw new Error(`Unknown file open mode: ${str}`);
      }
      return flags;
    };
    var FS_getMode = (canRead, canWrite) => {
      var mode = 0;
      if (canRead)
        mode |= 292 | 73;
      if (canWrite)
        mode |= 146;
      return mode;
    };
    var FS = { root: null, mounts: [], devices: {}, streams: [], nextInode: 1, nameTable: null, currentPath: "/", initialized: false, ignorePermissions: true, ErrnoError: class {
      name = "ErrnoError";
      constructor(errno) {
        this.errno = errno;
      }
    }, filesystems: null, syncFSRequests: 0, readFiles: {}, FSStream: class {
      shared = {};
      get object() {
        return this.node;
      }
      set object(val) {
        this.node = val;
      }
      get isRead() {
        return (this.flags & 2097155) !== 1;
      }
      get isWrite() {
        return (this.flags & 2097155) !== 0;
      }
      get isAppend() {
        return this.flags & 1024;
      }
      get flags() {
        return this.shared.flags;
      }
      set flags(val) {
        this.shared.flags = val;
      }
      get position() {
        return this.shared.position;
      }
      set position(val) {
        this.shared.position = val;
      }
    }, FSNode: class {
      node_ops = {};
      stream_ops = {};
      readMode = 292 | 73;
      writeMode = 146;
      mounted = null;
      constructor(parent, name, mode, rdev) {
        if (!parent) {
          parent = this;
        }
        this.parent = parent;
        this.mount = parent.mount;
        this.id = FS.nextInode++;
        this.name = name;
        this.mode = mode;
        this.rdev = rdev;
        this.atime = this.mtime = this.ctime = Date.now();
      }
      get read() {
        return (this.mode & this.readMode) === this.readMode;
      }
      set read(val) {
        val ? this.mode |= this.readMode : this.mode &= ~this.readMode;
      }
      get write() {
        return (this.mode & this.writeMode) === this.writeMode;
      }
      set write(val) {
        val ? this.mode |= this.writeMode : this.mode &= ~this.writeMode;
      }
      get isFolder() {
        return FS.isDir(this.mode);
      }
      get isDevice() {
        return FS.isChrdev(this.mode);
      }
    }, lookupPath(path, opts = {}) {
      if (!path) {
        throw new FS.ErrnoError(44);
      }
      opts.follow_mount ??= true;
      if (!PATH.isAbs(path)) {
        path = FS.cwd() + "/" + path;
      }
      linkloop:
        for (var nlinks = 0;nlinks < 40; nlinks++) {
          var parts = path.split("/").filter((p) => !!p);
          var current = FS.root;
          var current_path = "/";
          for (var i = 0;i < parts.length; i++) {
            var islast = i === parts.length - 1;
            if (islast && opts.parent) {
              break;
            }
            if (parts[i] === ".") {
              continue;
            }
            if (parts[i] === "..") {
              current_path = PATH.dirname(current_path);
              current = current.parent;
              continue;
            }
            current_path = PATH.join2(current_path, parts[i]);
            try {
              current = FS.lookupNode(current, parts[i]);
            } catch (e) {
              if (e?.errno === 44 && islast && opts.noent_okay) {
                return { path: current_path };
              }
              throw e;
            }
            if (FS.isMountpoint(current) && (!islast || opts.follow_mount)) {
              current = current.mounted.root;
            }
            if (FS.isLink(current.mode) && (!islast || opts.follow)) {
              if (!current.node_ops.readlink) {
                throw new FS.ErrnoError(52);
              }
              var link = current.node_ops.readlink(current);
              if (!PATH.isAbs(link)) {
                link = PATH.dirname(current_path) + "/" + link;
              }
              path = link + "/" + parts.slice(i + 1).join("/");
              continue linkloop;
            }
          }
          return { path: current_path, node: current };
        }
      throw new FS.ErrnoError(32);
    }, getPath(node) {
      var path;
      while (true) {
        if (FS.isRoot(node)) {
          var mount = node.mount.mountpoint;
          if (!path)
            return mount;
          return mount[mount.length - 1] !== "/" ? `${mount}/${path}` : mount + path;
        }
        path = path ? `${node.name}/${path}` : node.name;
        node = node.parent;
      }
    }, hashName(parentid, name) {
      var hash = 0;
      for (var i = 0;i < name.length; i++) {
        hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
      }
      return (parentid + hash >>> 0) % FS.nameTable.length;
    }, hashAddNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      node.name_next = FS.nameTable[hash];
      FS.nameTable[hash] = node;
    }, hashRemoveNode(node) {
      var hash = FS.hashName(node.parent.id, node.name);
      if (FS.nameTable[hash] === node) {
        FS.nameTable[hash] = node.name_next;
      } else {
        var current = FS.nameTable[hash];
        while (current) {
          if (current.name_next === node) {
            current.name_next = node.name_next;
            break;
          }
          current = current.name_next;
        }
      }
    }, lookupNode(parent, name) {
      var errCode = FS.mayLookup(parent);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      var hash = FS.hashName(parent.id, name);
      for (var node = FS.nameTable[hash];node; node = node.name_next) {
        var nodeName = node.name;
        if (node.parent.id === parent.id && nodeName === name) {
          return node;
        }
      }
      return FS.lookup(parent, name);
    }, createNode(parent, name, mode, rdev) {
      var node = new FS.FSNode(parent, name, mode, rdev);
      FS.hashAddNode(node);
      return node;
    }, destroyNode(node) {
      FS.hashRemoveNode(node);
    }, isRoot(node) {
      return node === node.parent;
    }, isMountpoint(node) {
      return !!node.mounted;
    }, isFile(mode) {
      return (mode & 61440) === 32768;
    }, isDir(mode) {
      return (mode & 61440) === 16384;
    }, isLink(mode) {
      return (mode & 61440) === 40960;
    }, isChrdev(mode) {
      return (mode & 61440) === 8192;
    }, isBlkdev(mode) {
      return (mode & 61440) === 24576;
    }, isFIFO(mode) {
      return (mode & 61440) === 4096;
    }, isSocket(mode) {
      return (mode & 49152) === 49152;
    }, flagsToPermissionString(flag) {
      var perms = ["r", "w", "rw"][flag & 3];
      if (flag & 512) {
        perms += "w";
      }
      return perms;
    }, nodePermissions(node, perms) {
      if (FS.ignorePermissions) {
        return 0;
      }
      if (perms.includes("r") && !(node.mode & 292)) {
        return 2;
      } else if (perms.includes("w") && !(node.mode & 146)) {
        return 2;
      } else if (perms.includes("x") && !(node.mode & 73)) {
        return 2;
      }
      return 0;
    }, mayLookup(dir) {
      if (!FS.isDir(dir.mode))
        return 54;
      var errCode = FS.nodePermissions(dir, "x");
      if (errCode)
        return errCode;
      if (!dir.node_ops.lookup)
        return 2;
      return 0;
    }, mayCreate(dir, name) {
      if (!FS.isDir(dir.mode)) {
        return 54;
      }
      try {
        var node = FS.lookupNode(dir, name);
        return 20;
      } catch (e) {
      }
      return FS.nodePermissions(dir, "wx");
    }, mayDelete(dir, name, isdir) {
      var node;
      try {
        node = FS.lookupNode(dir, name);
      } catch (e) {
        return e.errno;
      }
      var errCode = FS.nodePermissions(dir, "wx");
      if (errCode) {
        return errCode;
      }
      if (isdir) {
        if (!FS.isDir(node.mode)) {
          return 54;
        }
        if (FS.isRoot(node) || FS.getPath(node) === FS.cwd()) {
          return 10;
        }
      } else {
        if (FS.isDir(node.mode)) {
          return 31;
        }
      }
      return 0;
    }, mayOpen(node, flags) {
      if (!node) {
        return 44;
      }
      if (FS.isLink(node.mode)) {
        return 32;
      } else if (FS.isDir(node.mode)) {
        if (FS.flagsToPermissionString(flags) !== "r" || flags & (512 | 64)) {
          return 31;
        }
      }
      return FS.nodePermissions(node, FS.flagsToPermissionString(flags));
    }, checkOpExists(op, err2) {
      if (!op) {
        throw new FS.ErrnoError(err2);
      }
      return op;
    }, MAX_OPEN_FDS: 4096, nextfd() {
      for (var fd = 0;fd <= FS.MAX_OPEN_FDS; fd++) {
        if (!FS.streams[fd]) {
          return fd;
        }
      }
      throw new FS.ErrnoError(33);
    }, getStreamChecked(fd) {
      var stream = FS.getStream(fd);
      if (!stream) {
        throw new FS.ErrnoError(8);
      }
      return stream;
    }, getStream: (fd) => FS.streams[fd], createStream(stream, fd = -1) {
      stream = Object.assign(new FS.FSStream, stream);
      if (fd == -1) {
        fd = FS.nextfd();
      }
      stream.fd = fd;
      FS.streams[fd] = stream;
      return stream;
    }, closeStream(fd) {
      FS.streams[fd] = null;
    }, dupStream(origStream, fd = -1) {
      var stream = FS.createStream(origStream, fd);
      stream.stream_ops?.dup?.(stream);
      return stream;
    }, chrdev_stream_ops: { open(stream) {
      var device = FS.getDevice(stream.node.rdev);
      stream.stream_ops = device.stream_ops;
      stream.stream_ops.open?.(stream);
    }, llseek() {
      throw new FS.ErrnoError(70);
    } }, major: (dev) => dev >> 8, minor: (dev) => dev & 255, makedev: (ma, mi) => ma << 8 | mi, registerDevice(dev, ops) {
      FS.devices[dev] = { stream_ops: ops };
    }, getDevice: (dev) => FS.devices[dev], getMounts(mount) {
      var mounts = [];
      var check = [mount];
      while (check.length) {
        var m = check.pop();
        mounts.push(m);
        check.push(...m.mounts);
      }
      return mounts;
    }, syncfs(populate, callback) {
      if (typeof populate == "function") {
        callback = populate;
        populate = false;
      }
      FS.syncFSRequests++;
      if (FS.syncFSRequests > 1) {
        err(`warning: ${FS.syncFSRequests} FS.syncfs operations in flight at once, probably just doing extra work`);
      }
      var mounts = FS.getMounts(FS.root.mount);
      var completed = 0;
      function doCallback(errCode) {
        FS.syncFSRequests--;
        return callback(errCode);
      }
      function done(errCode) {
        if (errCode) {
          if (!done.errored) {
            done.errored = true;
            return doCallback(errCode);
          }
          return;
        }
        if (++completed >= mounts.length) {
          doCallback(null);
        }
      }
      mounts.forEach((mount) => {
        if (!mount.type.syncfs) {
          return done(null);
        }
        mount.type.syncfs(mount, populate, done);
      });
    }, mount(type, opts, mountpoint) {
      var root = mountpoint === "/";
      var pseudo = !mountpoint;
      var node;
      if (root && FS.root) {
        throw new FS.ErrnoError(10);
      } else if (!root && !pseudo) {
        var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
        mountpoint = lookup.path;
        node = lookup.node;
        if (FS.isMountpoint(node)) {
          throw new FS.ErrnoError(10);
        }
        if (!FS.isDir(node.mode)) {
          throw new FS.ErrnoError(54);
        }
      }
      var mount = { type, opts, mountpoint, mounts: [] };
      var mountRoot = type.mount(mount);
      mountRoot.mount = mount;
      mount.root = mountRoot;
      if (root) {
        FS.root = mountRoot;
      } else if (node) {
        node.mounted = mount;
        if (node.mount) {
          node.mount.mounts.push(mount);
        }
      }
      return mountRoot;
    }, unmount(mountpoint) {
      var lookup = FS.lookupPath(mountpoint, { follow_mount: false });
      if (!FS.isMountpoint(lookup.node)) {
        throw new FS.ErrnoError(28);
      }
      var node = lookup.node;
      var mount = node.mounted;
      var mounts = FS.getMounts(mount);
      Object.keys(FS.nameTable).forEach((hash) => {
        var current = FS.nameTable[hash];
        while (current) {
          var next = current.name_next;
          if (mounts.includes(current.mount)) {
            FS.destroyNode(current);
          }
          current = next;
        }
      });
      node.mounted = null;
      var idx = node.mount.mounts.indexOf(mount);
      node.mount.mounts.splice(idx, 1);
    }, lookup(parent, name) {
      return parent.node_ops.lookup(parent, name);
    }, mknod(path, mode, dev) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      if (!name) {
        throw new FS.ErrnoError(28);
      }
      if (name === "." || name === "..") {
        throw new FS.ErrnoError(20);
      }
      var errCode = FS.mayCreate(parent, name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.mknod) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.mknod(parent, name, mode, dev);
    }, statfs(path) {
      return FS.statfsNode(FS.lookupPath(path, { follow: true }).node);
    }, statfsStream(stream) {
      return FS.statfsNode(stream.node);
    }, statfsNode(node) {
      var rtn = { bsize: 4096, frsize: 4096, blocks: 1e6, bfree: 500000, bavail: 500000, files: FS.nextInode, ffree: FS.nextInode - 1, fsid: 42, flags: 2, namelen: 255 };
      if (node.node_ops.statfs) {
        Object.assign(rtn, node.node_ops.statfs(node.mount.opts.root));
      }
      return rtn;
    }, create(path, mode = 438) {
      mode &= 4095;
      mode |= 32768;
      return FS.mknod(path, mode, 0);
    }, mkdir(path, mode = 511) {
      mode &= 511 | 512;
      mode |= 16384;
      return FS.mknod(path, mode, 0);
    }, mkdirTree(path, mode) {
      var dirs = path.split("/");
      var d = "";
      for (var i = 0;i < dirs.length; ++i) {
        if (!dirs[i])
          continue;
        d += "/" + dirs[i];
        try {
          FS.mkdir(d, mode);
        } catch (e) {
          if (e.errno != 20)
            throw e;
        }
      }
    }, mkdev(path, mode, dev) {
      if (typeof dev == "undefined") {
        dev = mode;
        mode = 438;
      }
      mode |= 8192;
      return FS.mknod(path, mode, dev);
    }, symlink(oldpath, newpath) {
      if (!PATH_FS.resolve(oldpath)) {
        throw new FS.ErrnoError(44);
      }
      var lookup = FS.lookupPath(newpath, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var newname = PATH.basename(newpath);
      var errCode = FS.mayCreate(parent, newname);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.symlink) {
        throw new FS.ErrnoError(63);
      }
      return parent.node_ops.symlink(parent, newname, oldpath);
    }, rename(old_path, new_path) {
      var old_dirname = PATH.dirname(old_path);
      var new_dirname = PATH.dirname(new_path);
      var old_name = PATH.basename(old_path);
      var new_name = PATH.basename(new_path);
      var lookup, old_dir, new_dir;
      lookup = FS.lookupPath(old_path, { parent: true });
      old_dir = lookup.node;
      lookup = FS.lookupPath(new_path, { parent: true });
      new_dir = lookup.node;
      if (!old_dir || !new_dir)
        throw new FS.ErrnoError(44);
      if (old_dir.mount !== new_dir.mount) {
        throw new FS.ErrnoError(75);
      }
      var old_node = FS.lookupNode(old_dir, old_name);
      var relative = PATH_FS.relative(old_path, new_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(28);
      }
      relative = PATH_FS.relative(new_path, old_dirname);
      if (relative.charAt(0) !== ".") {
        throw new FS.ErrnoError(55);
      }
      var new_node;
      try {
        new_node = FS.lookupNode(new_dir, new_name);
      } catch (e) {
      }
      if (old_node === new_node) {
        return;
      }
      var isdir = FS.isDir(old_node.mode);
      var errCode = FS.mayDelete(old_dir, old_name, isdir);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      errCode = new_node ? FS.mayDelete(new_dir, new_name, isdir) : FS.mayCreate(new_dir, new_name);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!old_dir.node_ops.rename) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(old_node) || new_node && FS.isMountpoint(new_node)) {
        throw new FS.ErrnoError(10);
      }
      if (new_dir !== old_dir) {
        errCode = FS.nodePermissions(old_dir, "w");
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      FS.hashRemoveNode(old_node);
      try {
        old_dir.node_ops.rename(old_node, new_dir, new_name);
        old_node.parent = new_dir;
      } catch (e) {
        throw e;
      } finally {
        FS.hashAddNode(old_node);
      }
    }, rmdir(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, true);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.rmdir) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.rmdir(parent, name);
      FS.destroyNode(node);
    }, readdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      var readdir = FS.checkOpExists(node.node_ops.readdir, 54);
      return readdir(node);
    }, unlink(path) {
      var lookup = FS.lookupPath(path, { parent: true });
      var parent = lookup.node;
      if (!parent) {
        throw new FS.ErrnoError(44);
      }
      var name = PATH.basename(path);
      var node = FS.lookupNode(parent, name);
      var errCode = FS.mayDelete(parent, name, false);
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      if (!parent.node_ops.unlink) {
        throw new FS.ErrnoError(63);
      }
      if (FS.isMountpoint(node)) {
        throw new FS.ErrnoError(10);
      }
      parent.node_ops.unlink(parent, name);
      FS.destroyNode(node);
    }, readlink(path) {
      var lookup = FS.lookupPath(path);
      var link = lookup.node;
      if (!link) {
        throw new FS.ErrnoError(44);
      }
      if (!link.node_ops.readlink) {
        throw new FS.ErrnoError(28);
      }
      return link.node_ops.readlink(link);
    }, stat(path, dontFollow) {
      var lookup = FS.lookupPath(path, { follow: !dontFollow });
      var node = lookup.node;
      var getattr = FS.checkOpExists(node.node_ops.getattr, 63);
      return getattr(node);
    }, lstat(path) {
      return FS.stat(path, true);
    }, chmod(path, mode, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
      setattr(node, { mode: mode & 4095 | node.mode & ~4095, ctime: Date.now(), dontFollow });
    }, lchmod(path, mode) {
      FS.chmod(path, mode, true);
    }, fchmod(fd, mode) {
      var stream = FS.getStreamChecked(fd);
      FS.chmod(stream.node, mode);
    }, chown(path, uid, gid, dontFollow) {
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: !dontFollow });
        node = lookup.node;
      } else {
        node = path;
      }
      var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
      setattr(node, { timestamp: Date.now(), dontFollow });
    }, lchown(path, uid, gid) {
      FS.chown(path, uid, gid, true);
    }, fchown(fd, uid, gid) {
      var stream = FS.getStreamChecked(fd);
      FS.chown(stream.node, uid, gid);
    }, truncate(path, len) {
      if (len < 0) {
        throw new FS.ErrnoError(28);
      }
      var node;
      if (typeof path == "string") {
        var lookup = FS.lookupPath(path, { follow: true });
        node = lookup.node;
      } else {
        node = path;
      }
      if (FS.isDir(node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!FS.isFile(node.mode)) {
        throw new FS.ErrnoError(28);
      }
      var errCode = FS.nodePermissions(node, "w");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
      setattr(node, { size: len, timestamp: Date.now() });
    }, ftruncate(fd, len) {
      var stream = FS.getStreamChecked(fd);
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(28);
      }
      FS.truncate(stream.node, len);
    }, utime(path, atime, mtime) {
      var lookup = FS.lookupPath(path, { follow: true });
      var node = lookup.node;
      var setattr = FS.checkOpExists(node.node_ops.setattr, 63);
      setattr(node, { atime, mtime });
    }, open(path, flags, mode = 438) {
      if (path === "") {
        throw new FS.ErrnoError(44);
      }
      flags = typeof flags == "string" ? FS_modeStringToFlags(flags) : flags;
      if (flags & 64) {
        mode = mode & 4095 | 32768;
      } else {
        mode = 0;
      }
      var node;
      var isDirPath;
      if (typeof path == "object") {
        node = path;
      } else {
        isDirPath = path.endsWith("/");
        var lookup = FS.lookupPath(path, { follow: !(flags & 131072), noent_okay: true });
        node = lookup.node;
        path = lookup.path;
      }
      var created = false;
      if (flags & 64) {
        if (node) {
          if (flags & 128) {
            throw new FS.ErrnoError(20);
          }
        } else if (isDirPath) {
          throw new FS.ErrnoError(31);
        } else {
          node = FS.mknod(path, mode | 511, 0);
          created = true;
        }
      }
      if (!node) {
        throw new FS.ErrnoError(44);
      }
      if (FS.isChrdev(node.mode)) {
        flags &= ~512;
      }
      if (flags & 65536 && !FS.isDir(node.mode)) {
        throw new FS.ErrnoError(54);
      }
      if (!created) {
        var errCode = FS.mayOpen(node, flags);
        if (errCode) {
          throw new FS.ErrnoError(errCode);
        }
      }
      if (flags & 512 && !created) {
        FS.truncate(node, 0);
      }
      flags &= ~(128 | 512 | 131072);
      var stream = FS.createStream({ node, path: FS.getPath(node), flags, seekable: true, position: 0, stream_ops: node.stream_ops, ungotten: [], error: false });
      if (stream.stream_ops.open) {
        stream.stream_ops.open(stream);
      }
      if (created) {
        FS.chmod(node, mode & 511);
      }
      if (Module2["logReadFiles"] && !(flags & 1)) {
        if (!(path in FS.readFiles)) {
          FS.readFiles[path] = 1;
        }
      }
      return stream;
    }, close(stream) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (stream.getdents)
        stream.getdents = null;
      try {
        if (stream.stream_ops.close) {
          stream.stream_ops.close(stream);
        }
      } catch (e) {
        throw e;
      } finally {
        FS.closeStream(stream.fd);
      }
      stream.fd = null;
    }, isClosed(stream) {
      return stream.fd === null;
    }, llseek(stream, offset, whence) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (!stream.seekable || !stream.stream_ops.llseek) {
        throw new FS.ErrnoError(70);
      }
      if (whence != 0 && whence != 1 && whence != 2) {
        throw new FS.ErrnoError(28);
      }
      stream.position = stream.stream_ops.llseek(stream, offset, whence);
      stream.ungotten = [];
      return stream.position;
    }, read(stream, buffer, offset, length, position) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.read) {
        throw new FS.ErrnoError(28);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesRead = stream.stream_ops.read(stream, buffer, offset, length, position);
      if (!seeking)
        stream.position += bytesRead;
      return bytesRead;
    }, write(stream, buffer, offset, length, position, canOwn) {
      if (length < 0 || position < 0) {
        throw new FS.ErrnoError(28);
      }
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(31);
      }
      if (!stream.stream_ops.write) {
        throw new FS.ErrnoError(28);
      }
      if (stream.seekable && stream.flags & 1024) {
        FS.llseek(stream, 0, 2);
      }
      var seeking = typeof position != "undefined";
      if (!seeking) {
        position = stream.position;
      } else if (!stream.seekable) {
        throw new FS.ErrnoError(70);
      }
      var bytesWritten = stream.stream_ops.write(stream, buffer, offset, length, position, canOwn);
      if (!seeking)
        stream.position += bytesWritten;
      return bytesWritten;
    }, allocate(stream, offset, length) {
      if (FS.isClosed(stream)) {
        throw new FS.ErrnoError(8);
      }
      if (offset < 0 || length <= 0) {
        throw new FS.ErrnoError(28);
      }
      if ((stream.flags & 2097155) === 0) {
        throw new FS.ErrnoError(8);
      }
      if (!FS.isFile(stream.node.mode) && !FS.isDir(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (!stream.stream_ops.allocate) {
        throw new FS.ErrnoError(138);
      }
      stream.stream_ops.allocate(stream, offset, length);
    }, mmap(stream, length, position, prot, flags) {
      if ((prot & 2) !== 0 && (flags & 2) === 0 && (stream.flags & 2097155) !== 2) {
        throw new FS.ErrnoError(2);
      }
      if ((stream.flags & 2097155) === 1) {
        throw new FS.ErrnoError(2);
      }
      if (!stream.stream_ops.mmap) {
        throw new FS.ErrnoError(43);
      }
      if (!length) {
        throw new FS.ErrnoError(28);
      }
      return stream.stream_ops.mmap(stream, length, position, prot, flags);
    }, msync(stream, buffer, offset, length, mmapFlags) {
      if (!stream.stream_ops.msync) {
        return 0;
      }
      return stream.stream_ops.msync(stream, buffer, offset, length, mmapFlags);
    }, ioctl(stream, cmd, arg) {
      if (!stream.stream_ops.ioctl) {
        throw new FS.ErrnoError(59);
      }
      return stream.stream_ops.ioctl(stream, cmd, arg);
    }, readFile(path, opts = {}) {
      opts.flags = opts.flags || 0;
      opts.encoding = opts.encoding || "binary";
      if (opts.encoding !== "utf8" && opts.encoding !== "binary") {
        throw new Error(`Invalid encoding type "${opts.encoding}"`);
      }
      var ret;
      var stream = FS.open(path, opts.flags);
      var stat = FS.stat(path);
      var length = stat.size;
      var buf = new Uint8Array(length);
      FS.read(stream, buf, 0, length, 0);
      if (opts.encoding === "utf8") {
        ret = UTF8ArrayToString(buf);
      } else if (opts.encoding === "binary") {
        ret = buf;
      }
      FS.close(stream);
      return ret;
    }, writeFile(path, data, opts = {}) {
      opts.flags = opts.flags || 577;
      var stream = FS.open(path, opts.flags, opts.mode);
      if (typeof data == "string") {
        var buf = new Uint8Array(lengthBytesUTF8(data) + 1);
        var actualNumBytes = stringToUTF8Array(data, buf, 0, buf.length);
        FS.write(stream, buf, 0, actualNumBytes, undefined, opts.canOwn);
      } else if (ArrayBuffer.isView(data)) {
        FS.write(stream, data, 0, data.byteLength, undefined, opts.canOwn);
      } else {
        throw new Error("Unsupported data type");
      }
      FS.close(stream);
    }, cwd: () => FS.currentPath, chdir(path) {
      var lookup = FS.lookupPath(path, { follow: true });
      if (lookup.node === null) {
        throw new FS.ErrnoError(44);
      }
      if (!FS.isDir(lookup.node.mode)) {
        throw new FS.ErrnoError(54);
      }
      var errCode = FS.nodePermissions(lookup.node, "x");
      if (errCode) {
        throw new FS.ErrnoError(errCode);
      }
      FS.currentPath = lookup.path;
    }, createDefaultDirectories() {
      FS.mkdir("/tmp");
      FS.mkdir("/home");
      FS.mkdir("/home/web_user");
    }, createDefaultDevices() {
      FS.mkdir("/dev");
      FS.registerDevice(FS.makedev(1, 3), { read: () => 0, write: (stream, buffer, offset, length, pos) => length, llseek: () => 0 });
      FS.mkdev("/dev/null", FS.makedev(1, 3));
      TTY.register(FS.makedev(5, 0), TTY.default_tty_ops);
      TTY.register(FS.makedev(6, 0), TTY.default_tty1_ops);
      FS.mkdev("/dev/tty", FS.makedev(5, 0));
      FS.mkdev("/dev/tty1", FS.makedev(6, 0));
      var randomBuffer = new Uint8Array(1024), randomLeft = 0;
      var randomByte = () => {
        if (randomLeft === 0) {
          randomFill(randomBuffer);
          randomLeft = randomBuffer.byteLength;
        }
        return randomBuffer[--randomLeft];
      };
      FS.createDevice("/dev", "random", randomByte);
      FS.createDevice("/dev", "urandom", randomByte);
      FS.mkdir("/dev/shm");
      FS.mkdir("/dev/shm/tmp");
    }, createSpecialDirectories() {
      FS.mkdir("/proc");
      var proc_self = FS.mkdir("/proc/self");
      FS.mkdir("/proc/self/fd");
      FS.mount({ mount() {
        var node = FS.createNode(proc_self, "fd", 16895, 73);
        node.stream_ops = { llseek: MEMFS.stream_ops.llseek };
        node.node_ops = { lookup(parent, name) {
          var fd = +name;
          var stream = FS.getStreamChecked(fd);
          var ret = { parent: null, mount: { mountpoint: "fake" }, node_ops: { readlink: () => stream.path }, id: fd + 1 };
          ret.parent = ret;
          return ret;
        }, readdir() {
          return Array.from(FS.streams.entries()).filter(([k, v]) => v).map(([k, v]) => k.toString());
        } };
        return node;
      } }, {}, "/proc/self/fd");
    }, createStandardStreams(input, output, error) {
      if (input) {
        FS.createDevice("/dev", "stdin", input);
      } else {
        FS.symlink("/dev/tty", "/dev/stdin");
      }
      if (output) {
        FS.createDevice("/dev", "stdout", null, output);
      } else {
        FS.symlink("/dev/tty", "/dev/stdout");
      }
      if (error) {
        FS.createDevice("/dev", "stderr", null, error);
      } else {
        FS.symlink("/dev/tty1", "/dev/stderr");
      }
      var stdin = FS.open("/dev/stdin", 0);
      var stdout = FS.open("/dev/stdout", 1);
      var stderr = FS.open("/dev/stderr", 1);
    }, staticInit() {
      FS.nameTable = new Array(4096);
      FS.mount(MEMFS, {}, "/");
      FS.createDefaultDirectories();
      FS.createDefaultDevices();
      FS.createSpecialDirectories();
      FS.filesystems = { MEMFS };
    }, init(input, output, error) {
      FS.initialized = true;
      input ??= Module2["stdin"];
      output ??= Module2["stdout"];
      error ??= Module2["stderr"];
      FS.createStandardStreams(input, output, error);
    }, quit() {
      FS.initialized = false;
      for (var i = 0;i < FS.streams.length; i++) {
        var stream = FS.streams[i];
        if (!stream) {
          continue;
        }
        FS.close(stream);
      }
    }, findObject(path, dontResolveLastLink) {
      var ret = FS.analyzePath(path, dontResolveLastLink);
      if (!ret.exists) {
        return null;
      }
      return ret.object;
    }, analyzePath(path, dontResolveLastLink) {
      try {
        var lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        path = lookup.path;
      } catch (e) {
      }
      var ret = { isRoot: false, exists: false, error: 0, name: null, path: null, object: null, parentExists: false, parentPath: null, parentObject: null };
      try {
        var lookup = FS.lookupPath(path, { parent: true });
        ret.parentExists = true;
        ret.parentPath = lookup.path;
        ret.parentObject = lookup.node;
        ret.name = PATH.basename(path);
        lookup = FS.lookupPath(path, { follow: !dontResolveLastLink });
        ret.exists = true;
        ret.path = lookup.path;
        ret.object = lookup.node;
        ret.name = lookup.node.name;
        ret.isRoot = lookup.path === "/";
      } catch (e) {
        ret.error = e.errno;
      }
      return ret;
    }, createPath(parent, path, canRead, canWrite) {
      parent = typeof parent == "string" ? parent : FS.getPath(parent);
      var parts = path.split("/").reverse();
      while (parts.length) {
        var part = parts.pop();
        if (!part)
          continue;
        var current = PATH.join2(parent, part);
        try {
          FS.mkdir(current);
        } catch (e) {
        }
        parent = current;
      }
      return current;
    }, createFile(parent, name, properties, canRead, canWrite) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(canRead, canWrite);
      return FS.create(path, mode);
    }, createDataFile(parent, name, data, canRead, canWrite, canOwn) {
      var path = name;
      if (parent) {
        parent = typeof parent == "string" ? parent : FS.getPath(parent);
        path = name ? PATH.join2(parent, name) : parent;
      }
      var mode = FS_getMode(canRead, canWrite);
      var node = FS.create(path, mode);
      if (data) {
        if (typeof data == "string") {
          var arr = new Array(data.length);
          for (var i = 0, len = data.length;i < len; ++i)
            arr[i] = data.charCodeAt(i);
          data = arr;
        }
        FS.chmod(node, mode | 146);
        var stream = FS.open(node, 577);
        FS.write(stream, data, 0, data.length, 0, canOwn);
        FS.close(stream);
        FS.chmod(node, mode);
      }
    }, createDevice(parent, name, input, output) {
      var path = PATH.join2(typeof parent == "string" ? parent : FS.getPath(parent), name);
      var mode = FS_getMode(!!input, !!output);
      FS.createDevice.major ??= 64;
      var dev = FS.makedev(FS.createDevice.major++, 0);
      FS.registerDevice(dev, { open(stream) {
        stream.seekable = false;
      }, close(stream) {
        if (output?.buffer?.length) {
          output(10);
        }
      }, read(stream, buffer, offset, length, pos) {
        var bytesRead = 0;
        for (var i = 0;i < length; i++) {
          var result;
          try {
            result = input();
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
          if (result === undefined && bytesRead === 0) {
            throw new FS.ErrnoError(6);
          }
          if (result === null || result === undefined)
            break;
          bytesRead++;
          buffer[offset + i] = result;
        }
        if (bytesRead) {
          stream.node.atime = Date.now();
        }
        return bytesRead;
      }, write(stream, buffer, offset, length, pos) {
        for (var i = 0;i < length; i++) {
          try {
            output(buffer[offset + i]);
          } catch (e) {
            throw new FS.ErrnoError(29);
          }
        }
        if (length) {
          stream.node.mtime = stream.node.ctime = Date.now();
        }
        return i;
      } });
      return FS.mkdev(path, mode, dev);
    }, forceLoadFile(obj) {
      if (obj.isDevice || obj.isFolder || obj.link || obj.contents)
        return true;
      if (typeof XMLHttpRequest != "undefined") {
        throw new Error("Lazy loading should have been performed (contents set) in createLazyFile, but it was not. Lazy loading only works in web workers. Use --embed-file or --preload-file in emcc on the main thread.");
      } else {
        try {
          obj.contents = readBinary(obj.url);
          obj.usedBytes = obj.contents.length;
        } catch (e) {
          throw new FS.ErrnoError(29);
        }
      }
    }, createLazyFile(parent, name, url, canRead, canWrite) {

      class LazyUint8Array {
        lengthKnown = false;
        chunks = [];
        get(idx) {
          if (idx > this.length - 1 || idx < 0) {
            return;
          }
          var chunkOffset = idx % this.chunkSize;
          var chunkNum = idx / this.chunkSize | 0;
          return this.getter(chunkNum)[chunkOffset];
        }
        setDataGetter(getter) {
          this.getter = getter;
        }
        cacheLength() {
          var xhr = new XMLHttpRequest;
          xhr.open("HEAD", url, false);
          xhr.send(null);
          if (!(xhr.status >= 200 && xhr.status < 300 || xhr.status === 304))
            throw new Error("Couldn't load " + url + ". Status: " + xhr.status);
          var datalength = Number(xhr.getResponseHeader("Content-length"));
          var header;
          var hasByteServing = (header = xhr.getResponseHeader("Accept-Ranges")) && header === "bytes";
          var usesGzip = (header = xhr.getResponseHeader("Content-Encoding")) && header === "gzip";
          var chunkSize = 1024 * 1024;
          if (!hasByteServing)
            chunkSize = datalength;
          var doXHR = (from, to) => {
            if (from > to)
              throw new Error("invalid range (" + from + ", " + to + ") or no bytes requested!");
            if (to > datalength - 1)
              throw new Error("only " + datalength + " bytes available! programmer error!");
            var xhr2 = new XMLHttpRequest;
            xhr2.open("GET", url, false);
            if (datalength !== chunkSize)
              xhr2.setRequestHeader("Range", "bytes=" + from + "-" + to);
            xhr2.responseType = "arraybuffer";
            if (xhr2.overrideMimeType) {
              xhr2.overrideMimeType("text/plain; charset=x-user-defined");
            }
            xhr2.send(null);
            if (!(xhr2.status >= 200 && xhr2.status < 300 || xhr2.status === 304))
              throw new Error("Couldn't load " + url + ". Status: " + xhr2.status);
            if (xhr2.response !== undefined) {
              return new Uint8Array(xhr2.response || []);
            }
            return intArrayFromString(xhr2.responseText || "", true);
          };
          var lazyArray2 = this;
          lazyArray2.setDataGetter((chunkNum) => {
            var start = chunkNum * chunkSize;
            var end = (chunkNum + 1) * chunkSize - 1;
            end = Math.min(end, datalength - 1);
            if (typeof lazyArray2.chunks[chunkNum] == "undefined") {
              lazyArray2.chunks[chunkNum] = doXHR(start, end);
            }
            if (typeof lazyArray2.chunks[chunkNum] == "undefined")
              throw new Error("doXHR failed!");
            return lazyArray2.chunks[chunkNum];
          });
          if (usesGzip || !datalength) {
            chunkSize = datalength = 1;
            datalength = this.getter(0).length;
            chunkSize = datalength;
            out("LazyFiles on gzip forces download of the whole file when length is accessed");
          }
          this._length = datalength;
          this._chunkSize = chunkSize;
          this.lengthKnown = true;
        }
        get length() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._length;
        }
        get chunkSize() {
          if (!this.lengthKnown) {
            this.cacheLength();
          }
          return this._chunkSize;
        }
      }
      if (typeof XMLHttpRequest != "undefined") {
        if (!ENVIRONMENT_IS_WORKER)
          throw "Cannot do synchronous binary XHRs outside webworkers in modern browsers. Use --embed-file or --preload-file in emcc";
        var lazyArray = new LazyUint8Array;
        var properties = { isDevice: false, contents: lazyArray };
      } else {
        var properties = { isDevice: false, url };
      }
      var node = FS.createFile(parent, name, properties, canRead, canWrite);
      if (properties.contents) {
        node.contents = properties.contents;
      } else if (properties.url) {
        node.contents = null;
        node.url = properties.url;
      }
      Object.defineProperties(node, { usedBytes: { get: function() {
        return this.contents.length;
      } } });
      var stream_ops = {};
      var keys = Object.keys(node.stream_ops);
      keys.forEach((key) => {
        var fn = node.stream_ops[key];
        stream_ops[key] = (...args) => {
          FS.forceLoadFile(node);
          return fn(...args);
        };
      });
      function writeChunks(stream, buffer, offset, length, position) {
        var contents = stream.node.contents;
        if (position >= contents.length)
          return 0;
        var size = Math.min(contents.length - position, length);
        if (contents.slice) {
          for (var i = 0;i < size; i++) {
            buffer[offset + i] = contents[position + i];
          }
        } else {
          for (var i = 0;i < size; i++) {
            buffer[offset + i] = contents.get(position + i);
          }
        }
        return size;
      }
      stream_ops.read = (stream, buffer, offset, length, position) => {
        FS.forceLoadFile(node);
        return writeChunks(stream, buffer, offset, length, position);
      };
      stream_ops.mmap = (stream, length, position, prot, flags) => {
        FS.forceLoadFile(node);
        var ptr = mmapAlloc(length);
        if (!ptr) {
          throw new FS.ErrnoError(48);
        }
        writeChunks(stream, HEAP8, ptr, length, position);
        return { ptr, allocated: true };
      };
      node.stream_ops = stream_ops;
      return node;
    } };
    var SYSCALLS = { DEFAULT_POLLMASK: 5, calculateAt(dirfd, path, allowEmpty) {
      if (PATH.isAbs(path)) {
        return path;
      }
      var dir;
      if (dirfd === -100) {
        dir = FS.cwd();
      } else {
        var dirstream = SYSCALLS.getStreamFromFD(dirfd);
        dir = dirstream.path;
      }
      if (path.length == 0) {
        if (!allowEmpty) {
          throw new FS.ErrnoError(44);
        }
        return dir;
      }
      return dir + "/" + path;
    }, writeStat(buf, stat) {
      HEAP32[buf >> 2] = stat.dev;
      HEAP32[buf + 4 >> 2] = stat.mode;
      HEAPU32[buf + 8 >> 2] = stat.nlink;
      HEAP32[buf + 12 >> 2] = stat.uid;
      HEAP32[buf + 16 >> 2] = stat.gid;
      HEAP32[buf + 20 >> 2] = stat.rdev;
      tempI64 = [stat.size >>> 0, (tempDouble = stat.size, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 24 >> 2] = tempI64[0], HEAP32[buf + 28 >> 2] = tempI64[1];
      HEAP32[buf + 32 >> 2] = 4096;
      HEAP32[buf + 36 >> 2] = stat.blocks;
      var atime = stat.atime.getTime();
      var mtime = stat.mtime.getTime();
      var ctime = stat.ctime.getTime();
      tempI64 = [Math.floor(atime / 1000) >>> 0, (tempDouble = Math.floor(atime / 1000), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 40 >> 2] = tempI64[0], HEAP32[buf + 44 >> 2] = tempI64[1];
      HEAPU32[buf + 48 >> 2] = atime % 1000 * 1000 * 1000;
      tempI64 = [Math.floor(mtime / 1000) >>> 0, (tempDouble = Math.floor(mtime / 1000), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 56 >> 2] = tempI64[0], HEAP32[buf + 60 >> 2] = tempI64[1];
      HEAPU32[buf + 64 >> 2] = mtime % 1000 * 1000 * 1000;
      tempI64 = [Math.floor(ctime / 1000) >>> 0, (tempDouble = Math.floor(ctime / 1000), +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 72 >> 2] = tempI64[0], HEAP32[buf + 76 >> 2] = tempI64[1];
      HEAPU32[buf + 80 >> 2] = ctime % 1000 * 1000 * 1000;
      tempI64 = [stat.ino >>> 0, (tempDouble = stat.ino, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[buf + 88 >> 2] = tempI64[0], HEAP32[buf + 92 >> 2] = tempI64[1];
      return 0;
    }, writeStatFs(buf, stats) {
      HEAP32[buf + 4 >> 2] = stats.bsize;
      HEAP32[buf + 40 >> 2] = stats.bsize;
      HEAP32[buf + 8 >> 2] = stats.blocks;
      HEAP32[buf + 12 >> 2] = stats.bfree;
      HEAP32[buf + 16 >> 2] = stats.bavail;
      HEAP32[buf + 20 >> 2] = stats.files;
      HEAP32[buf + 24 >> 2] = stats.ffree;
      HEAP32[buf + 28 >> 2] = stats.fsid;
      HEAP32[buf + 44 >> 2] = stats.flags;
      HEAP32[buf + 36 >> 2] = stats.namelen;
    }, doMsync(addr, stream, len, flags, offset) {
      if (!FS.isFile(stream.node.mode)) {
        throw new FS.ErrnoError(43);
      }
      if (flags & 2) {
        return 0;
      }
      var buffer = HEAPU8.slice(addr, addr + len);
      FS.msync(stream, buffer, offset, len, flags);
    }, getStreamFromFD(fd) {
      var stream = FS.getStreamChecked(fd);
      return stream;
    }, varargs: undefined, getStr(ptr) {
      var ret = UTF8ToString(ptr);
      return ret;
    } };
    function ___syscall_chmod(path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        FS.chmod(path, mode);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_faccessat(dirfd, path, amode, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (amode & ~7) {
          return -28;
        }
        var lookup = FS.lookupPath(path, { follow: true });
        var node = lookup.node;
        if (!node) {
          return -44;
        }
        var perms = "";
        if (amode & 4)
          perms += "r";
        if (amode & 2)
          perms += "w";
        if (amode & 1)
          perms += "x";
        if (perms && FS.nodePermissions(node, perms)) {
          return -2;
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_fchmod(fd, mode) {
      try {
        FS.fchmod(fd, mode);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_fchown32(fd, owner, group) {
      try {
        FS.fchown(fd, owner, group);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var syscallGetVarargI = () => {
      var ret = HEAP32[+SYSCALLS.varargs >> 2];
      SYSCALLS.varargs += 4;
      return ret;
    };
    var syscallGetVarargP = syscallGetVarargI;
    function ___syscall_fcntl64(fd, cmd, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        switch (cmd) {
          case 0: {
            var arg = syscallGetVarargI();
            if (arg < 0) {
              return -28;
            }
            while (FS.streams[arg]) {
              arg++;
            }
            var newStream;
            newStream = FS.dupStream(stream, arg);
            return newStream.fd;
          }
          case 1:
          case 2:
            return 0;
          case 3:
            return stream.flags;
          case 4: {
            var arg = syscallGetVarargI();
            stream.flags |= arg;
            return 0;
          }
          case 12: {
            var arg = syscallGetVarargP();
            var offset = 0;
            HEAP16[arg + offset >> 1] = 2;
            return 0;
          }
          case 13:
          case 14:
            return 0;
        }
        return -28;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_fstat64(fd, buf) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return SYSCALLS.writeStat(buf, FS.stat(stream.path));
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
    function ___syscall_ftruncate64(fd, length_low, length_high) {
      var length = convertI32PairToI53Checked(length_low, length_high);
      try {
        if (isNaN(length))
          return 61;
        FS.ftruncate(fd, length);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
    function ___syscall_getcwd(buf, size) {
      try {
        if (size === 0)
          return -28;
        var cwd = FS.cwd();
        var cwdLengthInBytes = lengthBytesUTF8(cwd) + 1;
        if (size < cwdLengthInBytes)
          return -68;
        stringToUTF8(cwd, buf, size);
        return cwdLengthInBytes;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_lstat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.writeStat(buf, FS.lstat(path));
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_mkdirat(dirfd, path, mode) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        FS.mkdir(path, mode, 0);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_newfstatat(dirfd, path, buf, flags) {
      try {
        path = SYSCALLS.getStr(path);
        var nofollow = flags & 256;
        var allowEmpty = flags & 4096;
        flags = flags & ~6400;
        path = SYSCALLS.calculateAt(dirfd, path, allowEmpty);
        return SYSCALLS.writeStat(buf, nofollow ? FS.lstat(path) : FS.stat(path));
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_openat(dirfd, path, flags, varargs) {
      SYSCALLS.varargs = varargs;
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        var mode = varargs ? syscallGetVarargI() : 0;
        return FS.open(path, flags, mode).fd;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (bufsize <= 0)
          return -28;
        var ret = FS.readlink(path);
        var len = Math.min(bufsize, lengthBytesUTF8(ret));
        var endChar = HEAP8[buf + len];
        stringToUTF8(ret, buf, bufsize + 1);
        HEAP8[buf + len] = endChar;
        return len;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_rmdir(path) {
      try {
        path = SYSCALLS.getStr(path);
        FS.rmdir(path);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_stat64(path, buf) {
      try {
        path = SYSCALLS.getStr(path);
        return SYSCALLS.writeStat(buf, FS.stat(path));
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function ___syscall_unlinkat(dirfd, path, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path);
        if (flags === 0) {
          FS.unlink(path);
        } else if (flags === 512) {
          FS.rmdir(path);
        } else {
          abort("Invalid flags passed to unlinkat");
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var readI53FromI64 = (ptr) => HEAPU32[ptr >> 2] + HEAP32[ptr + 4 >> 2] * 4294967296;
    function ___syscall_utimensat(dirfd, path, times, flags) {
      try {
        path = SYSCALLS.getStr(path);
        path = SYSCALLS.calculateAt(dirfd, path, true);
        var now = Date.now(), atime, mtime;
        if (!times) {
          atime = now;
          mtime = now;
        } else {
          var seconds = readI53FromI64(times);
          var nanoseconds = HEAP32[times + 8 >> 2];
          if (nanoseconds == 1073741823) {
            atime = now;
          } else if (nanoseconds == 1073741822) {
            atime = null;
          } else {
            atime = seconds * 1000 + nanoseconds / (1000 * 1000);
          }
          times += 16;
          seconds = readI53FromI64(times);
          nanoseconds = HEAP32[times + 8 >> 2];
          if (nanoseconds == 1073741823) {
            mtime = now;
          } else if (nanoseconds == 1073741822) {
            mtime = null;
          } else {
            mtime = seconds * 1000 + nanoseconds / (1000 * 1000);
          }
        }
        if ((mtime ?? atime) !== null) {
          FS.utime(path, atime, mtime);
        }
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var __abort_js = () => abort("");
    var runtimeKeepaliveCounter = 0;
    var __emscripten_runtime_keepalive_clear = () => {
      noExitRuntime = false;
      runtimeKeepaliveCounter = 0;
    };
    var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    var MONTH_DAYS_LEAP_CUMULATIVE = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335];
    var MONTH_DAYS_REGULAR_CUMULATIVE = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    var ydayFromDate = (date) => {
      var leap = isLeapYear(date.getFullYear());
      var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
      var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
      return yday;
    };
    function __localtime_js(time_low, time_high, tmPtr) {
      var time = convertI32PairToI53Checked(time_low, time_high);
      var date = new Date(time * 1000);
      HEAP32[tmPtr >> 2] = date.getSeconds();
      HEAP32[tmPtr + 4 >> 2] = date.getMinutes();
      HEAP32[tmPtr + 8 >> 2] = date.getHours();
      HEAP32[tmPtr + 12 >> 2] = date.getDate();
      HEAP32[tmPtr + 16 >> 2] = date.getMonth();
      HEAP32[tmPtr + 20 >> 2] = date.getFullYear() - 1900;
      HEAP32[tmPtr + 24 >> 2] = date.getDay();
      var yday = ydayFromDate(date) | 0;
      HEAP32[tmPtr + 28 >> 2] = yday;
      HEAP32[tmPtr + 36 >> 2] = -(date.getTimezoneOffset() * 60);
      var start = new Date(date.getFullYear(), 0, 1);
      var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
      var winterOffset = start.getTimezoneOffset();
      var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
      HEAP32[tmPtr + 32 >> 2] = dst;
    }
    function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        if (isNaN(offset))
          return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        var res = FS.mmap(stream, len, offset, prot, flags);
        var ptr = res.ptr;
        HEAP32[allocated >> 2] = res.allocated;
        HEAPU32[addr >> 2] = ptr;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        if (prot & 2) {
          SYSCALLS.doMsync(addr, stream, len, flags, offset);
        }
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return -e.errno;
      }
    }
    var timers = {};
    var handleException = (e) => {
      if (e instanceof ExitStatus || e == "unwind") {
        return EXITSTATUS;
      }
      quit_(1, e);
    };
    var keepRuntimeAlive = () => noExitRuntime || runtimeKeepaliveCounter > 0;
    var _proc_exit = (code) => {
      EXITSTATUS = code;
      if (!keepRuntimeAlive()) {
        Module2["onExit"]?.(code);
        ABORT = true;
      }
      quit_(code, new ExitStatus(code));
    };
    var exitJS = (status, implicit) => {
      EXITSTATUS = status;
      _proc_exit(status);
    };
    var _exit = exitJS;
    var maybeExit = () => {
      if (!keepRuntimeAlive()) {
        try {
          _exit(EXITSTATUS);
        } catch (e) {
          handleException(e);
        }
      }
    };
    var callUserCallback = (func) => {
      if (ABORT) {
        return;
      }
      try {
        func();
        maybeExit();
      } catch (e) {
        handleException(e);
      }
    };
    var _emscripten_get_now = () => performance.now();
    var __setitimer_js = (which, timeout_ms) => {
      if (timers[which]) {
        clearTimeout(timers[which].id);
        delete timers[which];
      }
      if (!timeout_ms)
        return 0;
      var id = setTimeout(() => {
        delete timers[which];
        callUserCallback(() => __emscripten_timeout(which, _emscripten_get_now()));
      }, timeout_ms);
      timers[which] = { id, timeout_ms };
      return 0;
    };
    var __tzset_js = (timezone, daylight, std_name, dst_name) => {
      var currentYear = new Date().getFullYear();
      var winter = new Date(currentYear, 0, 1);
      var summer = new Date(currentYear, 6, 1);
      var winterOffset = winter.getTimezoneOffset();
      var summerOffset = summer.getTimezoneOffset();
      var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
      HEAPU32[timezone >> 2] = stdTimezoneOffset * 60;
      HEAP32[daylight >> 2] = Number(winterOffset != summerOffset);
      var extractZone = (timezoneOffset) => {
        var sign = timezoneOffset >= 0 ? "-" : "+";
        var absOffset = Math.abs(timezoneOffset);
        var hours = String(Math.floor(absOffset / 60)).padStart(2, "0");
        var minutes = String(absOffset % 60).padStart(2, "0");
        return `UTC${sign}${hours}${minutes}`;
      };
      var winterName = extractZone(winterOffset);
      var summerName = extractZone(summerOffset);
      if (summerOffset < winterOffset) {
        stringToUTF8(winterName, std_name, 17);
        stringToUTF8(summerName, dst_name, 17);
      } else {
        stringToUTF8(winterName, dst_name, 17);
        stringToUTF8(summerName, std_name, 17);
      }
    };
    var _emscripten_date_now = () => Date.now();
    var getHeapMax = () => 2147483648;
    var growMemory = (size) => {
      var b = wasmMemory.buffer;
      var pages = (size - b.byteLength + 65535) / 65536 | 0;
      try {
        wasmMemory.grow(pages);
        updateMemoryViews();
        return 1;
      } catch (e) {
      }
    };
    var _emscripten_resize_heap = (requestedSize) => {
      var oldSize = HEAPU8.length;
      requestedSize >>>= 0;
      var maxHeapSize = getHeapMax();
      if (requestedSize > maxHeapSize) {
        return false;
      }
      for (var cutDown = 1;cutDown <= 4; cutDown *= 2) {
        var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
        overGrownHeapSize = Math.min(overGrownHeapSize, requestedSize + 100663296);
        var newSize = Math.min(maxHeapSize, alignMemory(Math.max(requestedSize, overGrownHeapSize), 65536));
        var replacement = growMemory(newSize);
        if (replacement) {
          return true;
        }
      }
      return false;
    };
    var ENV = {};
    var getExecutableName = () => thisProgram || "./this.program";
    var getEnvStrings = () => {
      if (!getEnvStrings.strings) {
        var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
        var env = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: lang, _: getExecutableName() };
        for (var x in ENV) {
          if (ENV[x] === undefined)
            delete env[x];
          else
            env[x] = ENV[x];
        }
        var strings = [];
        for (var x in env) {
          strings.push(`${x}=${env[x]}`);
        }
        getEnvStrings.strings = strings;
      }
      return getEnvStrings.strings;
    };
    var stringToAscii = (str, buffer) => {
      for (var i = 0;i < str.length; ++i) {
        HEAP8[buffer++] = str.charCodeAt(i);
      }
      HEAP8[buffer] = 0;
    };
    var _environ_get = (__environ, environ_buf) => {
      var bufSize = 0;
      getEnvStrings().forEach((string, i) => {
        var ptr = environ_buf + bufSize;
        HEAPU32[__environ + i * 4 >> 2] = ptr;
        stringToAscii(string, ptr);
        bufSize += string.length + 1;
      });
      return 0;
    };
    var _environ_sizes_get = (penviron_count, penviron_buf_size) => {
      var strings = getEnvStrings();
      HEAPU32[penviron_count >> 2] = strings.length;
      var bufSize = 0;
      strings.forEach((string) => bufSize += string.length + 1);
      HEAPU32[penviron_buf_size >> 2] = bufSize;
      return 0;
    };
    function _fd_close(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.close(stream);
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    function _fd_fdstat_get(fd, pbuf) {
      try {
        var rightsBase = 0;
        var rightsInheriting = 0;
        var flags = 0;
        {
          var stream = SYSCALLS.getStreamFromFD(fd);
          var type = stream.tty ? 2 : FS.isDir(stream.mode) ? 3 : FS.isLink(stream.mode) ? 7 : 4;
        }
        HEAP8[pbuf] = type;
        HEAP16[pbuf + 2 >> 1] = flags;
        tempI64 = [rightsBase >>> 0, (tempDouble = rightsBase, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 8 >> 2] = tempI64[0], HEAP32[pbuf + 12 >> 2] = tempI64[1];
        tempI64 = [rightsInheriting >>> 0, (tempDouble = rightsInheriting, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[pbuf + 16 >> 2] = tempI64[0], HEAP32[pbuf + 20 >> 2] = tempI64[1];
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    var doReadv = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0;i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.read(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
        if (curr < len)
          break;
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_read(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doReadv(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
      var offset = convertI32PairToI53Checked(offset_low, offset_high);
      try {
        if (isNaN(offset))
          return 61;
        var stream = SYSCALLS.getStreamFromFD(fd);
        FS.llseek(stream, offset, whence);
        tempI64 = [stream.position >>> 0, (tempDouble = stream.position, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil((tempDouble - +(~~tempDouble >>> 0)) / 4294967296) >>> 0 : 0)], HEAP32[newOffset >> 2] = tempI64[0], HEAP32[newOffset + 4 >> 2] = tempI64[1];
        if (stream.getdents && offset === 0 && whence === 0)
          stream.getdents = null;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    var _fd_sync = function(fd) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        return Asyncify.handleSleep((wakeUp) => {
          var mount = stream.node.mount;
          if (!mount.type.syncfs) {
            wakeUp(0);
            return;
          }
          mount.type.syncfs(mount, false, (err2) => {
            if (err2) {
              wakeUp(29);
              return;
            }
            wakeUp(0);
          });
        });
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    };
    _fd_sync.isAsync = true;
    var doWritev = (stream, iov, iovcnt, offset) => {
      var ret = 0;
      for (var i = 0;i < iovcnt; i++) {
        var ptr = HEAPU32[iov >> 2];
        var len = HEAPU32[iov + 4 >> 2];
        iov += 8;
        var curr = FS.write(stream, HEAP8, ptr, len, offset);
        if (curr < 0)
          return -1;
        ret += curr;
        if (curr < len) {
          break;
        }
        if (typeof offset != "undefined") {
          offset += curr;
        }
      }
      return ret;
    };
    function _fd_write(fd, iov, iovcnt, pnum) {
      try {
        var stream = SYSCALLS.getStreamFromFD(fd);
        var num = doWritev(stream, iov, iovcnt);
        HEAPU32[pnum >> 2] = num;
        return 0;
      } catch (e) {
        if (typeof FS == "undefined" || !(e.name === "ErrnoError"))
          throw e;
        return e.errno;
      }
    }
    var adapters_support = function() {
      const handleAsync = typeof Asyncify === "object" ? Asyncify.handleAsync.bind(Asyncify) : null;
      Module2["handleAsync"] = handleAsync;
      const targets = new Map;
      Module2["setCallback"] = (key, target) => targets.set(key, target);
      Module2["getCallback"] = (key) => targets.get(key);
      Module2["deleteCallback"] = (key) => targets.delete(key);
      adapters_support = function(isAsync, key, ...args) {
        const receiver = targets.get(key);
        let methodName = null;
        const f = typeof receiver === "function" ? receiver : receiver[methodName = UTF8ToString(args.shift())];
        if (isAsync) {
          if (handleAsync) {
            return handleAsync(() => f.apply(receiver, args));
          }
          throw new Error("Synchronous WebAssembly cannot call async function");
        }
        const result = f.apply(receiver, args);
        if (typeof result?.then == "function") {
          console.error("unexpected Promise", f);
          throw new Error(`${methodName} unexpectedly returned a Promise`);
        }
        return result;
      };
    };
    function _ipp(...args) {
      return adapters_support(false, ...args);
    }
    function _ipp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipp_async.isAsync = true;
    function _ippipppp(...args) {
      return adapters_support(false, ...args);
    }
    function _ippipppp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippipppp_async.isAsync = true;
    function _ippp(...args) {
      return adapters_support(false, ...args);
    }
    function _ippp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippp_async.isAsync = true;
    function _ipppi(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppi_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppi_async.isAsync = true;
    function _ipppiii(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppiii_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppiii_async.isAsync = true;
    function _ipppiiip(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppiiip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppiiip_async.isAsync = true;
    function _ipppip(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppip_async.isAsync = true;
    function _ipppj(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppj_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppj_async.isAsync = true;
    function _ipppp(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppp_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppp_async.isAsync = true;
    function _ippppi(...args) {
      return adapters_support(false, ...args);
    }
    function _ippppi_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippppi_async.isAsync = true;
    function _ippppij(...args) {
      return adapters_support(false, ...args);
    }
    function _ippppij_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippppij_async.isAsync = true;
    function _ippppip(...args) {
      return adapters_support(false, ...args);
    }
    function _ippppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ippppip_async.isAsync = true;
    function _ipppppip(...args) {
      return adapters_support(false, ...args);
    }
    function _ipppppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _ipppppip_async.isAsync = true;
    function _vppippii(...args) {
      return adapters_support(false, ...args);
    }
    function _vppippii_async(...args) {
      return adapters_support(true, ...args);
    }
    _vppippii_async.isAsync = true;
    function _vppp(...args) {
      return adapters_support(false, ...args);
    }
    function _vppp_async(...args) {
      return adapters_support(true, ...args);
    }
    _vppp_async.isAsync = true;
    function _vpppip(...args) {
      return adapters_support(false, ...args);
    }
    function _vpppip_async(...args) {
      return adapters_support(true, ...args);
    }
    _vpppip_async.isAsync = true;
    var runAndAbortIfError = (func) => {
      try {
        return func();
      } catch (e) {
        abort(e);
      }
    };
    var sigToWasmTypes = (sig) => {
      var typeNames = { i: "i32", j: "i64", f: "f32", d: "f64", e: "externref", p: "i32" };
      var type = { parameters: [], results: sig[0] == "v" ? [] : [typeNames[sig[0]]] };
      for (var i = 1;i < sig.length; ++i) {
        type.parameters.push(typeNames[sig[i]]);
      }
      return type;
    };
    var runtimeKeepalivePush = () => {
      runtimeKeepaliveCounter += 1;
    };
    var runtimeKeepalivePop = () => {
      runtimeKeepaliveCounter -= 1;
    };
    var Asyncify = { instrumentWasmImports(imports) {
      var importPattern = /^(ipp|ipp_async|ippp|ippp_async|vppp|vppp_async|ipppj|ipppj_async|ipppi|ipppi_async|ipppp|ipppp_async|ipppip|ipppip_async|vpppip|vpppip_async|ippppi|ippppi_async|ippppij|ippppij_async|ipppiii|ipppiii_async|ippppip|ippppip_async|ippipppp|ippipppp_async|ipppppip|ipppppip_async|ipppiiip|ipppiiip_async|vppippii|vppippii_async|invoke_.*|__asyncjs__.*)$/;
      for (let [x, original] of Object.entries(imports)) {
        if (typeof original == "function") {
          let isAsyncifyImport = original.isAsync || importPattern.test(x);
        }
      }
    }, instrumentWasmExports(exports) {
      var ret = {};
      for (let [x, original] of Object.entries(exports)) {
        if (typeof original == "function") {
          ret[x] = (...args) => {
            Asyncify.exportCallStack.push(x);
            try {
              return original(...args);
            } finally {
              if (!ABORT) {
                var y = Asyncify.exportCallStack.pop();
                Asyncify.maybeStopUnwind();
              }
            }
          };
        } else {
          ret[x] = original;
        }
      }
      return ret;
    }, State: { Normal: 0, Unwinding: 1, Rewinding: 2, Disabled: 3 }, state: 0, StackSize: 16384, currData: null, handleSleepReturnValue: 0, exportCallStack: [], callStackNameToId: {}, callStackIdToName: {}, callStackId: 0, asyncPromiseHandlers: null, sleepCallbacks: [], getCallStackId(funcName) {
      var id = Asyncify.callStackNameToId[funcName];
      if (id === undefined) {
        id = Asyncify.callStackId++;
        Asyncify.callStackNameToId[funcName] = id;
        Asyncify.callStackIdToName[id] = funcName;
      }
      return id;
    }, maybeStopUnwind() {
      if (Asyncify.currData && Asyncify.state === Asyncify.State.Unwinding && Asyncify.exportCallStack.length === 0) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(_asyncify_stop_unwind);
        if (typeof Fibers != "undefined") {
          Fibers.trampoline();
        }
      }
    }, whenDone() {
      return new Promise((resolve, reject) => {
        Asyncify.asyncPromiseHandlers = { resolve, reject };
      });
    }, allocateData() {
      var ptr = _malloc(12 + Asyncify.StackSize);
      Asyncify.setDataHeader(ptr, ptr + 12, Asyncify.StackSize);
      Asyncify.setDataRewindFunc(ptr);
      return ptr;
    }, setDataHeader(ptr, stack, stackSize) {
      HEAPU32[ptr >> 2] = stack;
      HEAPU32[ptr + 4 >> 2] = stack + stackSize;
    }, setDataRewindFunc(ptr) {
      var bottomOfCallStack = Asyncify.exportCallStack[0];
      var rewindId = Asyncify.getCallStackId(bottomOfCallStack);
      HEAP32[ptr + 8 >> 2] = rewindId;
    }, getDataRewindFuncName(ptr) {
      var id = HEAP32[ptr + 8 >> 2];
      var name = Asyncify.callStackIdToName[id];
      return name;
    }, getDataRewindFunc(name) {
      var func = wasmExports[name];
      return func;
    }, doRewind(ptr) {
      var name = Asyncify.getDataRewindFuncName(ptr);
      var func = Asyncify.getDataRewindFunc(name);
      return func();
    }, handleSleep(startAsync) {
      if (ABORT)
        return;
      if (Asyncify.state === Asyncify.State.Normal) {
        var reachedCallback = false;
        var reachedAfterCallback = false;
        startAsync((handleSleepReturnValue = 0) => {
          if (ABORT)
            return;
          Asyncify.handleSleepReturnValue = handleSleepReturnValue;
          reachedCallback = true;
          if (!reachedAfterCallback) {
            return;
          }
          Asyncify.state = Asyncify.State.Rewinding;
          runAndAbortIfError(() => _asyncify_start_rewind(Asyncify.currData));
          if (typeof MainLoop != "undefined" && MainLoop.func) {
            MainLoop.resume();
          }
          var asyncWasmReturnValue, isError = false;
          try {
            asyncWasmReturnValue = Asyncify.doRewind(Asyncify.currData);
          } catch (err2) {
            asyncWasmReturnValue = err2;
            isError = true;
          }
          var handled = false;
          if (!Asyncify.currData) {
            var asyncPromiseHandlers = Asyncify.asyncPromiseHandlers;
            if (asyncPromiseHandlers) {
              Asyncify.asyncPromiseHandlers = null;
              (isError ? asyncPromiseHandlers.reject : asyncPromiseHandlers.resolve)(asyncWasmReturnValue);
              handled = true;
            }
          }
          if (isError && !handled) {
            throw asyncWasmReturnValue;
          }
        });
        reachedAfterCallback = true;
        if (!reachedCallback) {
          Asyncify.state = Asyncify.State.Unwinding;
          Asyncify.currData = Asyncify.allocateData();
          if (typeof MainLoop != "undefined" && MainLoop.func) {
            MainLoop.pause();
          }
          runAndAbortIfError(() => _asyncify_start_unwind(Asyncify.currData));
        }
      } else if (Asyncify.state === Asyncify.State.Rewinding) {
        Asyncify.state = Asyncify.State.Normal;
        runAndAbortIfError(_asyncify_stop_rewind);
        _free(Asyncify.currData);
        Asyncify.currData = null;
        Asyncify.sleepCallbacks.forEach(callUserCallback);
      } else {
        abort(`invalid state: ${Asyncify.state}`);
      }
      return Asyncify.handleSleepReturnValue;
    }, handleAsync(startAsync) {
      return Asyncify.handleSleep((wakeUp) => {
        startAsync().then(wakeUp);
      });
    } };
    var uleb128Encode = (n, target) => {
      if (n < 128) {
        target.push(n);
      } else {
        target.push(n % 128 | 128, n >> 7);
      }
    };
    var generateFuncType = (sig, target) => {
      var sigRet = sig.slice(0, 1);
      var sigParam = sig.slice(1);
      var typeCodes = { i: 127, p: 127, j: 126, f: 125, d: 124, e: 111 };
      target.push(96);
      uleb128Encode(sigParam.length, target);
      for (var i = 0;i < sigParam.length; ++i) {
        target.push(typeCodes[sigParam[i]]);
      }
      if (sigRet == "v") {
        target.push(0);
      } else {
        target.push(1, typeCodes[sigRet]);
      }
    };
    var convertJsFunctionToWasm = (func, sig) => {
      if (typeof WebAssembly.Function == "function") {
        return new WebAssembly.Function(sigToWasmTypes(sig), func);
      }
      var typeSectionBody = [1];
      generateFuncType(sig, typeSectionBody);
      var bytes = [0, 97, 115, 109, 1, 0, 0, 0, 1];
      uleb128Encode(typeSectionBody.length, bytes);
      bytes.push(...typeSectionBody);
      bytes.push(2, 7, 1, 1, 101, 1, 102, 0, 0, 7, 5, 1, 1, 102, 0, 0);
      var module = new WebAssembly.Module(new Uint8Array(bytes));
      var instance = new WebAssembly.Instance(module, { e: { f: func } });
      var wrappedFunc = instance.exports["f"];
      return wrappedFunc;
    };
    var wasmTable;
    var getWasmTableEntry = (funcPtr) => wasmTable.get(funcPtr);
    var updateTableMap = (offset, count) => {
      if (functionsInTableMap) {
        for (var i = offset;i < offset + count; i++) {
          var item = getWasmTableEntry(i);
          if (item) {
            functionsInTableMap.set(item, i);
          }
        }
      }
    };
    var functionsInTableMap;
    var getFunctionAddress = (func) => {
      if (!functionsInTableMap) {
        functionsInTableMap = new WeakMap;
        updateTableMap(0, wasmTable.length);
      }
      return functionsInTableMap.get(func) || 0;
    };
    var freeTableIndexes = [];
    var getEmptyTableSlot = () => {
      if (freeTableIndexes.length) {
        return freeTableIndexes.pop();
      }
      try {
        wasmTable.grow(1);
      } catch (err2) {
        if (!(err2 instanceof RangeError)) {
          throw err2;
        }
        throw "Unable to grow wasm table. Set ALLOW_TABLE_GROWTH.";
      }
      return wasmTable.length - 1;
    };
    var setWasmTableEntry = (idx, func) => wasmTable.set(idx, func);
    var addFunction = (func, sig) => {
      var rtn = getFunctionAddress(func);
      if (rtn) {
        return rtn;
      }
      var ret = getEmptyTableSlot();
      try {
        setWasmTableEntry(ret, func);
      } catch (err2) {
        if (!(err2 instanceof TypeError)) {
          throw err2;
        }
        var wrapped = convertJsFunctionToWasm(func, sig);
        setWasmTableEntry(ret, wrapped);
      }
      functionsInTableMap.set(func, ret);
      return ret;
    };
    var getCFunc = (ident) => {
      var func = Module2["_" + ident];
      return func;
    };
    var writeArrayToMemory = (array, buffer) => {
      HEAP8.set(array, buffer);
    };
    var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
    var stringToUTF8OnStack = (str) => {
      var size = lengthBytesUTF8(str) + 1;
      var ret = stackAlloc(size);
      stringToUTF8(str, ret, size);
      return ret;
    };
    var ccall = (ident, returnType, argTypes, args, opts) => {
      var toC = { string: (str) => {
        var ret2 = 0;
        if (str !== null && str !== undefined && str !== 0) {
          ret2 = stringToUTF8OnStack(str);
        }
        return ret2;
      }, array: (arr) => {
        var ret2 = stackAlloc(arr.length);
        writeArrayToMemory(arr, ret2);
        return ret2;
      } };
      function convertReturnValue(ret2) {
        if (returnType === "string") {
          return UTF8ToString(ret2);
        }
        if (returnType === "boolean")
          return Boolean(ret2);
        return ret2;
      }
      var func = getCFunc(ident);
      var cArgs = [];
      var stack = 0;
      if (args) {
        for (var i = 0;i < args.length; i++) {
          var converter = toC[argTypes[i]];
          if (converter) {
            if (stack === 0)
              stack = stackSave();
            cArgs[i] = converter(args[i]);
          } else {
            cArgs[i] = args[i];
          }
        }
      }
      var previousAsync = Asyncify.currData;
      var ret = func(...cArgs);
      function onDone(ret2) {
        runtimeKeepalivePop();
        if (stack !== 0)
          stackRestore(stack);
        return convertReturnValue(ret2);
      }
      var asyncMode = opts?.async;
      runtimeKeepalivePush();
      if (Asyncify.currData != previousAsync) {
        return Asyncify.whenDone().then(onDone);
      }
      ret = onDone(ret);
      if (asyncMode)
        return Promise.resolve(ret);
      return ret;
    };
    var cwrap = (ident, returnType, argTypes, opts) => {
      var numericArgs = !argTypes || argTypes.every((type) => type === "number" || type === "boolean");
      var numericRet = returnType !== "string";
      if (numericRet && numericArgs && !opts) {
        return getCFunc(ident);
      }
      return (...args) => ccall(ident, returnType, argTypes, args, opts);
    };
    var getTempRet0 = (val) => __emscripten_tempret_get();
    var stringToUTF16 = (str, outPtr, maxBytesToWrite) => {
      maxBytesToWrite ??= 2147483647;
      if (maxBytesToWrite < 2)
        return 0;
      maxBytesToWrite -= 2;
      var startPtr = outPtr;
      var numCharsToWrite = maxBytesToWrite < str.length * 2 ? maxBytesToWrite / 2 : str.length;
      for (var i = 0;i < numCharsToWrite; ++i) {
        var codeUnit = str.charCodeAt(i);
        HEAP16[outPtr >> 1] = codeUnit;
        outPtr += 2;
      }
      HEAP16[outPtr >> 1] = 0;
      return outPtr - startPtr;
    };
    var stringToUTF32 = (str, outPtr, maxBytesToWrite) => {
      maxBytesToWrite ??= 2147483647;
      if (maxBytesToWrite < 4)
        return 0;
      var startPtr = outPtr;
      var endPtr = startPtr + maxBytesToWrite - 4;
      for (var i = 0;i < str.length; ++i) {
        var codeUnit = str.charCodeAt(i);
        if (codeUnit >= 55296 && codeUnit <= 57343) {
          var trailSurrogate = str.charCodeAt(++i);
          codeUnit = 65536 + ((codeUnit & 1023) << 10) | trailSurrogate & 1023;
        }
        HEAP32[outPtr >> 2] = codeUnit;
        outPtr += 4;
        if (outPtr + 4 > endPtr)
          break;
      }
      HEAP32[outPtr >> 2] = 0;
      return outPtr - startPtr;
    };
    var AsciiToString = (ptr) => {
      var str = "";
      while (true) {
        var ch = HEAPU8[ptr++];
        if (!ch)
          return str;
        str += String.fromCharCode(ch);
      }
    };
    var UTF16Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf-16le") : undefined;
    var UTF16ToString = (ptr, maxBytesToRead) => {
      var endPtr = ptr;
      var idx = endPtr >> 1;
      var maxIdx = idx + maxBytesToRead / 2;
      while (!(idx >= maxIdx) && HEAPU16[idx])
        ++idx;
      endPtr = idx << 1;
      if (endPtr - ptr > 32 && UTF16Decoder)
        return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
      var str = "";
      for (var i = 0;!(i >= maxBytesToRead / 2); ++i) {
        var codeUnit = HEAP16[ptr + i * 2 >> 1];
        if (codeUnit == 0)
          break;
        str += String.fromCharCode(codeUnit);
      }
      return str;
    };
    var UTF32ToString = (ptr, maxBytesToRead) => {
      var i = 0;
      var str = "";
      while (!(i >= maxBytesToRead / 4)) {
        var utf32 = HEAP32[ptr + i * 4 >> 2];
        if (utf32 == 0)
          break;
        ++i;
        if (utf32 >= 65536) {
          var ch = utf32 - 65536;
          str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
        } else {
          str += String.fromCharCode(utf32);
        }
      }
      return str;
    };
    function intArrayToString(array) {
      var ret = [];
      for (var i = 0;i < array.length; i++) {
        var chr = array[i];
        if (chr > 255) {
          chr &= 255;
        }
        ret.push(String.fromCharCode(chr));
      }
      return ret.join("");
    }
    FS.createPreloadedFile = FS_createPreloadedFile;
    FS.staticInit();
    MEMFS.doesNotExistError = new FS.ErrnoError(44);
    MEMFS.doesNotExistError.stack = "<generic error, no stack>";
    adapters_support();
    var wasmImports = { a: ___assert_fail, aa: ___syscall_chmod, da: ___syscall_faccessat, ba: ___syscall_fchmod, $: ___syscall_fchown32, b: ___syscall_fcntl64, _: ___syscall_fstat64, y: ___syscall_ftruncate64, U: ___syscall_getcwd, Y: ___syscall_lstat64, R: ___syscall_mkdirat, X: ___syscall_newfstatat, P: ___syscall_openat, N: ___syscall_readlinkat, M: ___syscall_rmdir, Z: ___syscall_stat64, K: ___syscall_unlinkat, J: ___syscall_utimensat, F: __abort_js, E: __emscripten_runtime_keepalive_clear, w: __localtime_js, u: __mmap_js, v: __munmap_js, G: __setitimer_js, Q: __tzset_js, n: _emscripten_date_now, g: _emscripten_get_now, H: _emscripten_resize_heap, S: _environ_get, T: _environ_sizes_get, o: _fd_close, I: _fd_fdstat_get, O: _fd_read, x: _fd_seek, V: _fd_sync, L: _fd_write, s: _ipp, t: _ipp_async, ka: _ippipppp, oa: _ippipppp_async, j: _ippp, k: _ippp_async, c: _ipppi, d: _ipppi_async, ga: _ipppiii, ha: _ipppiii_async, ia: _ipppiiip, ja: _ipppiiip_async, h: _ipppip, i: _ipppip_async, z: _ipppj, A: _ipppj_async, e: _ipppp, f: _ipppp_async, ea: _ippppi, fa: _ippppi_async, B: _ippppij, C: _ippppij_async, p: _ippppip, q: _ippppip_async, la: _ipppppip, ma: _ipppppip_async, D: _proc_exit, na: _vppippii, r: _vppippii_async, l: _vppp, m: _vppp_async, W: _vpppip, ca: _vpppip_async };
    var wasmExports = await createWasm();
    var ___wasm_call_ctors = wasmExports["qa"];
    var _sqlite3_status64 = Module2["_sqlite3_status64"] = wasmExports["ra"];
    var _sqlite3_status = Module2["_sqlite3_status"] = wasmExports["sa"];
    var _sqlite3_db_status = Module2["_sqlite3_db_status"] = wasmExports["ta"];
    var _sqlite3_msize = Module2["_sqlite3_msize"] = wasmExports["ua"];
    var _sqlite3_vfs_find = Module2["_sqlite3_vfs_find"] = wasmExports["va"];
    var _sqlite3_vfs_register = Module2["_sqlite3_vfs_register"] = wasmExports["wa"];
    var _sqlite3_vfs_unregister = Module2["_sqlite3_vfs_unregister"] = wasmExports["xa"];
    var _sqlite3_release_memory = Module2["_sqlite3_release_memory"] = wasmExports["ya"];
    var _sqlite3_soft_heap_limit64 = Module2["_sqlite3_soft_heap_limit64"] = wasmExports["za"];
    var _sqlite3_memory_used = Module2["_sqlite3_memory_used"] = wasmExports["Aa"];
    var _sqlite3_hard_heap_limit64 = Module2["_sqlite3_hard_heap_limit64"] = wasmExports["Ba"];
    var _sqlite3_memory_highwater = Module2["_sqlite3_memory_highwater"] = wasmExports["Ca"];
    var _sqlite3_malloc = Module2["_sqlite3_malloc"] = wasmExports["Da"];
    var _sqlite3_malloc64 = Module2["_sqlite3_malloc64"] = wasmExports["Ea"];
    var _sqlite3_free = Module2["_sqlite3_free"] = wasmExports["Fa"];
    var _sqlite3_realloc = Module2["_sqlite3_realloc"] = wasmExports["Ga"];
    var _sqlite3_realloc64 = Module2["_sqlite3_realloc64"] = wasmExports["Ha"];
    var _sqlite3_str_vappendf = Module2["_sqlite3_str_vappendf"] = wasmExports["Ia"];
    var _sqlite3_str_append = Module2["_sqlite3_str_append"] = wasmExports["Ja"];
    var _sqlite3_str_appendchar = Module2["_sqlite3_str_appendchar"] = wasmExports["Ka"];
    var _sqlite3_str_appendall = Module2["_sqlite3_str_appendall"] = wasmExports["La"];
    var _sqlite3_str_appendf = Module2["_sqlite3_str_appendf"] = wasmExports["Ma"];
    var _sqlite3_str_finish = Module2["_sqlite3_str_finish"] = wasmExports["Na"];
    var _sqlite3_str_errcode = Module2["_sqlite3_str_errcode"] = wasmExports["Oa"];
    var _sqlite3_str_length = Module2["_sqlite3_str_length"] = wasmExports["Pa"];
    var _sqlite3_str_value = Module2["_sqlite3_str_value"] = wasmExports["Qa"];
    var _sqlite3_str_reset = Module2["_sqlite3_str_reset"] = wasmExports["Ra"];
    var _sqlite3_str_new = Module2["_sqlite3_str_new"] = wasmExports["Sa"];
    var _sqlite3_vmprintf = Module2["_sqlite3_vmprintf"] = wasmExports["Ta"];
    var _sqlite3_mprintf = Module2["_sqlite3_mprintf"] = wasmExports["Ua"];
    var _sqlite3_vsnprintf = Module2["_sqlite3_vsnprintf"] = wasmExports["Va"];
    var _sqlite3_snprintf = Module2["_sqlite3_snprintf"] = wasmExports["Wa"];
    var _sqlite3_log = Module2["_sqlite3_log"] = wasmExports["Xa"];
    var _sqlite3_randomness = Module2["_sqlite3_randomness"] = wasmExports["Ya"];
    var _sqlite3_stricmp = Module2["_sqlite3_stricmp"] = wasmExports["Za"];
    var _sqlite3_strnicmp = Module2["_sqlite3_strnicmp"] = wasmExports["_a"];
    var _sqlite3_os_init = Module2["_sqlite3_os_init"] = wasmExports["$a"];
    var _sqlite3_os_end = Module2["_sqlite3_os_end"] = wasmExports["ab"];
    var _sqlite3_serialize = Module2["_sqlite3_serialize"] = wasmExports["bb"];
    var _sqlite3_prepare_v2 = Module2["_sqlite3_prepare_v2"] = wasmExports["cb"];
    var _sqlite3_step = Module2["_sqlite3_step"] = wasmExports["db"];
    var _sqlite3_column_int64 = Module2["_sqlite3_column_int64"] = wasmExports["eb"];
    var _sqlite3_reset = Module2["_sqlite3_reset"] = wasmExports["fb"];
    var _sqlite3_exec = Module2["_sqlite3_exec"] = wasmExports["gb"];
    var _sqlite3_column_int = Module2["_sqlite3_column_int"] = wasmExports["hb"];
    var _sqlite3_finalize = Module2["_sqlite3_finalize"] = wasmExports["ib"];
    var _sqlite3_deserialize = Module2["_sqlite3_deserialize"] = wasmExports["jb"];
    var _sqlite3_database_file_object = Module2["_sqlite3_database_file_object"] = wasmExports["kb"];
    var _sqlite3_backup_init = Module2["_sqlite3_backup_init"] = wasmExports["lb"];
    var _sqlite3_backup_step = Module2["_sqlite3_backup_step"] = wasmExports["mb"];
    var _sqlite3_backup_finish = Module2["_sqlite3_backup_finish"] = wasmExports["nb"];
    var _sqlite3_backup_remaining = Module2["_sqlite3_backup_remaining"] = wasmExports["ob"];
    var _sqlite3_backup_pagecount = Module2["_sqlite3_backup_pagecount"] = wasmExports["pb"];
    var _sqlite3_clear_bindings = Module2["_sqlite3_clear_bindings"] = wasmExports["qb"];
    var _sqlite3_value_blob = Module2["_sqlite3_value_blob"] = wasmExports["rb"];
    var _sqlite3_value_text = Module2["_sqlite3_value_text"] = wasmExports["sb"];
    var _sqlite3_value_bytes = Module2["_sqlite3_value_bytes"] = wasmExports["tb"];
    var _sqlite3_value_bytes16 = Module2["_sqlite3_value_bytes16"] = wasmExports["ub"];
    var _sqlite3_value_double = Module2["_sqlite3_value_double"] = wasmExports["vb"];
    var _sqlite3_value_int = Module2["_sqlite3_value_int"] = wasmExports["wb"];
    var _sqlite3_value_int64 = Module2["_sqlite3_value_int64"] = wasmExports["xb"];
    var _sqlite3_value_subtype = Module2["_sqlite3_value_subtype"] = wasmExports["yb"];
    var _sqlite3_value_pointer = Module2["_sqlite3_value_pointer"] = wasmExports["zb"];
    var _sqlite3_value_text16 = Module2["_sqlite3_value_text16"] = wasmExports["Ab"];
    var _sqlite3_value_text16be = Module2["_sqlite3_value_text16be"] = wasmExports["Bb"];
    var _sqlite3_value_text16le = Module2["_sqlite3_value_text16le"] = wasmExports["Cb"];
    var _sqlite3_value_type = Module2["_sqlite3_value_type"] = wasmExports["Db"];
    var _sqlite3_value_encoding = Module2["_sqlite3_value_encoding"] = wasmExports["Eb"];
    var _sqlite3_value_nochange = Module2["_sqlite3_value_nochange"] = wasmExports["Fb"];
    var _sqlite3_value_frombind = Module2["_sqlite3_value_frombind"] = wasmExports["Gb"];
    var _sqlite3_value_dup = Module2["_sqlite3_value_dup"] = wasmExports["Hb"];
    var _sqlite3_value_free = Module2["_sqlite3_value_free"] = wasmExports["Ib"];
    var _sqlite3_result_blob = Module2["_sqlite3_result_blob"] = wasmExports["Jb"];
    var _sqlite3_result_blob64 = Module2["_sqlite3_result_blob64"] = wasmExports["Kb"];
    var _sqlite3_result_double = Module2["_sqlite3_result_double"] = wasmExports["Lb"];
    var _sqlite3_result_error = Module2["_sqlite3_result_error"] = wasmExports["Mb"];
    var _sqlite3_result_error16 = Module2["_sqlite3_result_error16"] = wasmExports["Nb"];
    var _sqlite3_result_int = Module2["_sqlite3_result_int"] = wasmExports["Ob"];
    var _sqlite3_result_int64 = Module2["_sqlite3_result_int64"] = wasmExports["Pb"];
    var _sqlite3_result_null = Module2["_sqlite3_result_null"] = wasmExports["Qb"];
    var _sqlite3_result_pointer = Module2["_sqlite3_result_pointer"] = wasmExports["Rb"];
    var _sqlite3_result_subtype = Module2["_sqlite3_result_subtype"] = wasmExports["Sb"];
    var _sqlite3_result_text = Module2["_sqlite3_result_text"] = wasmExports["Tb"];
    var _sqlite3_result_text64 = Module2["_sqlite3_result_text64"] = wasmExports["Ub"];
    var _sqlite3_result_text16 = Module2["_sqlite3_result_text16"] = wasmExports["Vb"];
    var _sqlite3_result_text16be = Module2["_sqlite3_result_text16be"] = wasmExports["Wb"];
    var _sqlite3_result_text16le = Module2["_sqlite3_result_text16le"] = wasmExports["Xb"];
    var _sqlite3_result_value = Module2["_sqlite3_result_value"] = wasmExports["Yb"];
    var _sqlite3_result_error_toobig = Module2["_sqlite3_result_error_toobig"] = wasmExports["Zb"];
    var _sqlite3_result_zeroblob = Module2["_sqlite3_result_zeroblob"] = wasmExports["_b"];
    var _sqlite3_result_zeroblob64 = Module2["_sqlite3_result_zeroblob64"] = wasmExports["$b"];
    var _sqlite3_result_error_code = Module2["_sqlite3_result_error_code"] = wasmExports["ac"];
    var _sqlite3_result_error_nomem = Module2["_sqlite3_result_error_nomem"] = wasmExports["bc"];
    var _sqlite3_user_data = Module2["_sqlite3_user_data"] = wasmExports["cc"];
    var _sqlite3_context_db_handle = Module2["_sqlite3_context_db_handle"] = wasmExports["dc"];
    var _sqlite3_vtab_nochange = Module2["_sqlite3_vtab_nochange"] = wasmExports["ec"];
    var _sqlite3_vtab_in_first = Module2["_sqlite3_vtab_in_first"] = wasmExports["fc"];
    var _sqlite3_vtab_in_next = Module2["_sqlite3_vtab_in_next"] = wasmExports["gc"];
    var _sqlite3_aggregate_context = Module2["_sqlite3_aggregate_context"] = wasmExports["hc"];
    var _sqlite3_get_auxdata = Module2["_sqlite3_get_auxdata"] = wasmExports["ic"];
    var _sqlite3_set_auxdata = Module2["_sqlite3_set_auxdata"] = wasmExports["jc"];
    var _sqlite3_column_count = Module2["_sqlite3_column_count"] = wasmExports["kc"];
    var _sqlite3_data_count = Module2["_sqlite3_data_count"] = wasmExports["lc"];
    var _sqlite3_column_blob = Module2["_sqlite3_column_blob"] = wasmExports["mc"];
    var _sqlite3_column_bytes = Module2["_sqlite3_column_bytes"] = wasmExports["nc"];
    var _sqlite3_column_bytes16 = Module2["_sqlite3_column_bytes16"] = wasmExports["oc"];
    var _sqlite3_column_double = Module2["_sqlite3_column_double"] = wasmExports["pc"];
    var _sqlite3_column_text = Module2["_sqlite3_column_text"] = wasmExports["qc"];
    var _sqlite3_column_value = Module2["_sqlite3_column_value"] = wasmExports["rc"];
    var _sqlite3_column_text16 = Module2["_sqlite3_column_text16"] = wasmExports["sc"];
    var _sqlite3_column_type = Module2["_sqlite3_column_type"] = wasmExports["tc"];
    var _sqlite3_column_name = Module2["_sqlite3_column_name"] = wasmExports["uc"];
    var _sqlite3_column_name16 = Module2["_sqlite3_column_name16"] = wasmExports["vc"];
    var _sqlite3_bind_blob = Module2["_sqlite3_bind_blob"] = wasmExports["wc"];
    var _sqlite3_bind_blob64 = Module2["_sqlite3_bind_blob64"] = wasmExports["xc"];
    var _sqlite3_bind_double = Module2["_sqlite3_bind_double"] = wasmExports["yc"];
    var _sqlite3_bind_int = Module2["_sqlite3_bind_int"] = wasmExports["zc"];
    var _sqlite3_bind_int64 = Module2["_sqlite3_bind_int64"] = wasmExports["Ac"];
    var _sqlite3_bind_null = Module2["_sqlite3_bind_null"] = wasmExports["Bc"];
    var _sqlite3_bind_pointer = Module2["_sqlite3_bind_pointer"] = wasmExports["Cc"];
    var _sqlite3_bind_text = Module2["_sqlite3_bind_text"] = wasmExports["Dc"];
    var _sqlite3_bind_text64 = Module2["_sqlite3_bind_text64"] = wasmExports["Ec"];
    var _sqlite3_bind_text16 = Module2["_sqlite3_bind_text16"] = wasmExports["Fc"];
    var _sqlite3_bind_value = Module2["_sqlite3_bind_value"] = wasmExports["Gc"];
    var _sqlite3_bind_zeroblob = Module2["_sqlite3_bind_zeroblob"] = wasmExports["Hc"];
    var _sqlite3_bind_zeroblob64 = Module2["_sqlite3_bind_zeroblob64"] = wasmExports["Ic"];
    var _sqlite3_bind_parameter_count = Module2["_sqlite3_bind_parameter_count"] = wasmExports["Jc"];
    var _sqlite3_bind_parameter_name = Module2["_sqlite3_bind_parameter_name"] = wasmExports["Kc"];
    var _sqlite3_bind_parameter_index = Module2["_sqlite3_bind_parameter_index"] = wasmExports["Lc"];
    var _sqlite3_db_handle = Module2["_sqlite3_db_handle"] = wasmExports["Mc"];
    var _sqlite3_stmt_readonly = Module2["_sqlite3_stmt_readonly"] = wasmExports["Nc"];
    var _sqlite3_stmt_isexplain = Module2["_sqlite3_stmt_isexplain"] = wasmExports["Oc"];
    var _sqlite3_stmt_explain = Module2["_sqlite3_stmt_explain"] = wasmExports["Pc"];
    var _sqlite3_stmt_busy = Module2["_sqlite3_stmt_busy"] = wasmExports["Qc"];
    var _sqlite3_next_stmt = Module2["_sqlite3_next_stmt"] = wasmExports["Rc"];
    var _sqlite3_stmt_status = Module2["_sqlite3_stmt_status"] = wasmExports["Sc"];
    var _sqlite3_sql = Module2["_sqlite3_sql"] = wasmExports["Tc"];
    var _sqlite3_expanded_sql = Module2["_sqlite3_expanded_sql"] = wasmExports["Uc"];
    var _sqlite3_value_numeric_type = Module2["_sqlite3_value_numeric_type"] = wasmExports["Vc"];
    var _sqlite3_blob_open = Module2["_sqlite3_blob_open"] = wasmExports["Wc"];
    var _sqlite3_blob_close = Module2["_sqlite3_blob_close"] = wasmExports["Xc"];
    var _sqlite3_blob_read = Module2["_sqlite3_blob_read"] = wasmExports["Yc"];
    var _sqlite3_blob_write = Module2["_sqlite3_blob_write"] = wasmExports["Zc"];
    var _sqlite3_blob_bytes = Module2["_sqlite3_blob_bytes"] = wasmExports["_c"];
    var _sqlite3_blob_reopen = Module2["_sqlite3_blob_reopen"] = wasmExports["$c"];
    var _sqlite3_set_authorizer = Module2["_sqlite3_set_authorizer"] = wasmExports["ad"];
    var _sqlite3_strglob = Module2["_sqlite3_strglob"] = wasmExports["bd"];
    var _sqlite3_strlike = Module2["_sqlite3_strlike"] = wasmExports["cd"];
    var _sqlite3_errmsg = Module2["_sqlite3_errmsg"] = wasmExports["dd"];
    var _sqlite3_auto_extension = Module2["_sqlite3_auto_extension"] = wasmExports["ed"];
    var _sqlite3_cancel_auto_extension = Module2["_sqlite3_cancel_auto_extension"] = wasmExports["fd"];
    var _sqlite3_reset_auto_extension = Module2["_sqlite3_reset_auto_extension"] = wasmExports["gd"];
    var _sqlite3_prepare = Module2["_sqlite3_prepare"] = wasmExports["hd"];
    var _sqlite3_prepare_v3 = Module2["_sqlite3_prepare_v3"] = wasmExports["id"];
    var _sqlite3_prepare16 = Module2["_sqlite3_prepare16"] = wasmExports["jd"];
    var _sqlite3_prepare16_v2 = Module2["_sqlite3_prepare16_v2"] = wasmExports["kd"];
    var _sqlite3_prepare16_v3 = Module2["_sqlite3_prepare16_v3"] = wasmExports["ld"];
    var _sqlite3_get_table = Module2["_sqlite3_get_table"] = wasmExports["md"];
    var _sqlite3_free_table = Module2["_sqlite3_free_table"] = wasmExports["nd"];
    var _sqlite3_create_module = Module2["_sqlite3_create_module"] = wasmExports["od"];
    var _sqlite3_create_module_v2 = Module2["_sqlite3_create_module_v2"] = wasmExports["pd"];
    var _sqlite3_drop_modules = Module2["_sqlite3_drop_modules"] = wasmExports["qd"];
    var _sqlite3_declare_vtab = Module2["_sqlite3_declare_vtab"] = wasmExports["rd"];
    var _sqlite3_vtab_on_conflict = Module2["_sqlite3_vtab_on_conflict"] = wasmExports["sd"];
    var _sqlite3_vtab_config = Module2["_sqlite3_vtab_config"] = wasmExports["td"];
    var _sqlite3_vtab_collation = Module2["_sqlite3_vtab_collation"] = wasmExports["ud"];
    var _sqlite3_vtab_in = Module2["_sqlite3_vtab_in"] = wasmExports["vd"];
    var _sqlite3_vtab_rhs_value = Module2["_sqlite3_vtab_rhs_value"] = wasmExports["wd"];
    var _sqlite3_vtab_distinct = Module2["_sqlite3_vtab_distinct"] = wasmExports["xd"];
    var _sqlite3_keyword_name = Module2["_sqlite3_keyword_name"] = wasmExports["yd"];
    var _sqlite3_keyword_count = Module2["_sqlite3_keyword_count"] = wasmExports["zd"];
    var _sqlite3_keyword_check = Module2["_sqlite3_keyword_check"] = wasmExports["Ad"];
    var _sqlite3_complete = Module2["_sqlite3_complete"] = wasmExports["Bd"];
    var _sqlite3_complete16 = Module2["_sqlite3_complete16"] = wasmExports["Cd"];
    var _sqlite3_libversion = Module2["_sqlite3_libversion"] = wasmExports["Dd"];
    var _sqlite3_libversion_number = Module2["_sqlite3_libversion_number"] = wasmExports["Ed"];
    var _sqlite3_threadsafe = Module2["_sqlite3_threadsafe"] = wasmExports["Fd"];
    var _sqlite3_initialize = Module2["_sqlite3_initialize"] = wasmExports["Gd"];
    var _sqlite3_shutdown = Module2["_sqlite3_shutdown"] = wasmExports["Hd"];
    var _sqlite3_config = Module2["_sqlite3_config"] = wasmExports["Id"];
    var _sqlite3_db_mutex = Module2["_sqlite3_db_mutex"] = wasmExports["Jd"];
    var _sqlite3_db_release_memory = Module2["_sqlite3_db_release_memory"] = wasmExports["Kd"];
    var _sqlite3_db_cacheflush = Module2["_sqlite3_db_cacheflush"] = wasmExports["Ld"];
    var _sqlite3_db_config = Module2["_sqlite3_db_config"] = wasmExports["Md"];
    var _sqlite3_last_insert_rowid = Module2["_sqlite3_last_insert_rowid"] = wasmExports["Nd"];
    var _sqlite3_set_last_insert_rowid = Module2["_sqlite3_set_last_insert_rowid"] = wasmExports["Od"];
    var _sqlite3_changes64 = Module2["_sqlite3_changes64"] = wasmExports["Pd"];
    var _sqlite3_changes = Module2["_sqlite3_changes"] = wasmExports["Qd"];
    var _sqlite3_total_changes64 = Module2["_sqlite3_total_changes64"] = wasmExports["Rd"];
    var _sqlite3_total_changes = Module2["_sqlite3_total_changes"] = wasmExports["Sd"];
    var _sqlite3_txn_state = Module2["_sqlite3_txn_state"] = wasmExports["Td"];
    var _sqlite3_close = Module2["_sqlite3_close"] = wasmExports["Ud"];
    var _sqlite3_close_v2 = Module2["_sqlite3_close_v2"] = wasmExports["Vd"];
    var _sqlite3_busy_handler = Module2["_sqlite3_busy_handler"] = wasmExports["Wd"];
    var _sqlite3_progress_handler = Module2["_sqlite3_progress_handler"] = wasmExports["Xd"];
    var _sqlite3_busy_timeout = Module2["_sqlite3_busy_timeout"] = wasmExports["Yd"];
    var _sqlite3_interrupt = Module2["_sqlite3_interrupt"] = wasmExports["Zd"];
    var _sqlite3_is_interrupted = Module2["_sqlite3_is_interrupted"] = wasmExports["_d"];
    var _sqlite3_create_function = Module2["_sqlite3_create_function"] = wasmExports["$d"];
    var _sqlite3_create_function_v2 = Module2["_sqlite3_create_function_v2"] = wasmExports["ae"];
    var _sqlite3_create_window_function = Module2["_sqlite3_create_window_function"] = wasmExports["be"];
    var _sqlite3_create_function16 = Module2["_sqlite3_create_function16"] = wasmExports["ce"];
    var _sqlite3_overload_function = Module2["_sqlite3_overload_function"] = wasmExports["de"];
    var _sqlite3_trace_v2 = Module2["_sqlite3_trace_v2"] = wasmExports["ee"];
    var _sqlite3_commit_hook = Module2["_sqlite3_commit_hook"] = wasmExports["fe"];
    var _sqlite3_update_hook = Module2["_sqlite3_update_hook"] = wasmExports["ge"];
    var _sqlite3_rollback_hook = Module2["_sqlite3_rollback_hook"] = wasmExports["he"];
    var _sqlite3_autovacuum_pages = Module2["_sqlite3_autovacuum_pages"] = wasmExports["ie"];
    var _sqlite3_wal_autocheckpoint = Module2["_sqlite3_wal_autocheckpoint"] = wasmExports["je"];
    var _sqlite3_wal_hook = Module2["_sqlite3_wal_hook"] = wasmExports["ke"];
    var _sqlite3_wal_checkpoint_v2 = Module2["_sqlite3_wal_checkpoint_v2"] = wasmExports["le"];
    var _sqlite3_wal_checkpoint = Module2["_sqlite3_wal_checkpoint"] = wasmExports["me"];
    var _sqlite3_error_offset = Module2["_sqlite3_error_offset"] = wasmExports["ne"];
    var _sqlite3_errmsg16 = Module2["_sqlite3_errmsg16"] = wasmExports["oe"];
    var _sqlite3_errcode = Module2["_sqlite3_errcode"] = wasmExports["pe"];
    var _sqlite3_extended_errcode = Module2["_sqlite3_extended_errcode"] = wasmExports["qe"];
    var _sqlite3_system_errno = Module2["_sqlite3_system_errno"] = wasmExports["re"];
    var _sqlite3_errstr = Module2["_sqlite3_errstr"] = wasmExports["se"];
    var _sqlite3_limit = Module2["_sqlite3_limit"] = wasmExports["te"];
    var _sqlite3_open = Module2["_sqlite3_open"] = wasmExports["ue"];
    var _sqlite3_open_v2 = Module2["_sqlite3_open_v2"] = wasmExports["ve"];
    var _sqlite3_open16 = Module2["_sqlite3_open16"] = wasmExports["we"];
    var _sqlite3_create_collation = Module2["_sqlite3_create_collation"] = wasmExports["xe"];
    var _sqlite3_create_collation_v2 = Module2["_sqlite3_create_collation_v2"] = wasmExports["ye"];
    var _sqlite3_create_collation16 = Module2["_sqlite3_create_collation16"] = wasmExports["ze"];
    var _sqlite3_collation_needed = Module2["_sqlite3_collation_needed"] = wasmExports["Ae"];
    var _sqlite3_collation_needed16 = Module2["_sqlite3_collation_needed16"] = wasmExports["Be"];
    var _sqlite3_get_clientdata = Module2["_sqlite3_get_clientdata"] = wasmExports["Ce"];
    var _sqlite3_set_clientdata = Module2["_sqlite3_set_clientdata"] = wasmExports["De"];
    var _sqlite3_get_autocommit = Module2["_sqlite3_get_autocommit"] = wasmExports["Ee"];
    var _sqlite3_table_column_metadata = Module2["_sqlite3_table_column_metadata"] = wasmExports["Fe"];
    var _sqlite3_sleep = Module2["_sqlite3_sleep"] = wasmExports["Ge"];
    var _sqlite3_extended_result_codes = Module2["_sqlite3_extended_result_codes"] = wasmExports["He"];
    var _sqlite3_file_control = Module2["_sqlite3_file_control"] = wasmExports["Ie"];
    var _sqlite3_test_control = Module2["_sqlite3_test_control"] = wasmExports["Je"];
    var _sqlite3_create_filename = Module2["_sqlite3_create_filename"] = wasmExports["Ke"];
    var _sqlite3_free_filename = Module2["_sqlite3_free_filename"] = wasmExports["Le"];
    var _sqlite3_uri_parameter = Module2["_sqlite3_uri_parameter"] = wasmExports["Me"];
    var _sqlite3_uri_key = Module2["_sqlite3_uri_key"] = wasmExports["Ne"];
    var _sqlite3_uri_boolean = Module2["_sqlite3_uri_boolean"] = wasmExports["Oe"];
    var _sqlite3_uri_int64 = Module2["_sqlite3_uri_int64"] = wasmExports["Pe"];
    var _sqlite3_filename_database = Module2["_sqlite3_filename_database"] = wasmExports["Qe"];
    var _sqlite3_filename_journal = Module2["_sqlite3_filename_journal"] = wasmExports["Re"];
    var _sqlite3_filename_wal = Module2["_sqlite3_filename_wal"] = wasmExports["Se"];
    var _sqlite3_db_name = Module2["_sqlite3_db_name"] = wasmExports["Te"];
    var _sqlite3_db_filename = Module2["_sqlite3_db_filename"] = wasmExports["Ue"];
    var _sqlite3_db_readonly = Module2["_sqlite3_db_readonly"] = wasmExports["Ve"];
    var _sqlite3_compileoption_used = Module2["_sqlite3_compileoption_used"] = wasmExports["We"];
    var _sqlite3_compileoption_get = Module2["_sqlite3_compileoption_get"] = wasmExports["Xe"];
    var _sqlite3_sourceid = Module2["_sqlite3_sourceid"] = wasmExports["Ye"];
    var _malloc = Module2["_malloc"] = wasmExports["Ze"];
    var _free = Module2["_free"] = wasmExports["_e"];
    var _RegisterExtensionFunctions = Module2["_RegisterExtensionFunctions"] = wasmExports["$e"];
    var _getSqliteFree = Module2["_getSqliteFree"] = wasmExports["af"];
    var _main = Module2["_main"] = wasmExports["bf"];
    var _libauthorizer_set_authorizer = Module2["_libauthorizer_set_authorizer"] = wasmExports["cf"];
    var _libfunction_create_function = Module2["_libfunction_create_function"] = wasmExports["df"];
    var _libhook_commit_hook = Module2["_libhook_commit_hook"] = wasmExports["ef"];
    var _libhook_update_hook = Module2["_libhook_update_hook"] = wasmExports["ff"];
    var _libprogress_progress_handler = Module2["_libprogress_progress_handler"] = wasmExports["gf"];
    var _libvfs_vfs_register = Module2["_libvfs_vfs_register"] = wasmExports["hf"];
    var _emscripten_builtin_memalign = wasmExports["kf"];
    var __emscripten_timeout = wasmExports["lf"];
    var __emscripten_tempret_get = wasmExports["mf"];
    var __emscripten_stack_restore = wasmExports["nf"];
    var __emscripten_stack_alloc = wasmExports["of"];
    var _emscripten_stack_get_current = wasmExports["pf"];
    var _asyncify_start_unwind = wasmExports["qf"];
    var _asyncify_stop_unwind = wasmExports["rf"];
    var _asyncify_start_rewind = wasmExports["sf"];
    var _asyncify_stop_rewind = wasmExports["tf"];
    var _sqlite3_version = Module2["_sqlite3_version"] = 5472;
    Module2["getTempRet0"] = getTempRet0;
    Module2["ccall"] = ccall;
    Module2["cwrap"] = cwrap;
    Module2["addFunction"] = addFunction;
    Module2["setValue"] = setValue;
    Module2["getValue"] = getValue;
    Module2["UTF8ToString"] = UTF8ToString;
    Module2["stringToUTF8"] = stringToUTF8;
    Module2["lengthBytesUTF8"] = lengthBytesUTF8;
    Module2["intArrayFromString"] = intArrayFromString;
    Module2["intArrayToString"] = intArrayToString;
    Module2["AsciiToString"] = AsciiToString;
    Module2["UTF16ToString"] = UTF16ToString;
    Module2["stringToUTF16"] = stringToUTF16;
    Module2["UTF32ToString"] = UTF32ToString;
    Module2["stringToUTF32"] = stringToUTF32;
    Module2["writeArrayToMemory"] = writeArrayToMemory;
    function callMain() {
      var entryFunction = _main;
      var argc = 0;
      var argv = 0;
      try {
        var ret = entryFunction(argc, argv);
        exitJS(ret, true);
        return ret;
      } catch (e) {
        return handleException(e);
      }
    }
    function run() {
      if (runDependencies > 0) {
        dependenciesFulfilled = run;
        return;
      }
      preRun();
      if (runDependencies > 0) {
        dependenciesFulfilled = run;
        return;
      }
      function doRun() {
        Module2["calledRun"] = true;
        if (ABORT)
          return;
        initRuntime();
        preMain();
        readyPromiseResolve(Module2);
        Module2["onRuntimeInitialized"]?.();
        var noInitialRun = Module2["noInitialRun"];
        if (!noInitialRun)
          callMain();
        postRun();
      }
      if (Module2["setStatus"]) {
        Module2["setStatus"]("Running...");
        setTimeout(() => {
          setTimeout(() => Module2["setStatus"](""), 1);
          doRun();
        }, 1);
      } else {
        doRun();
      }
    }
    if (Module2["preInit"]) {
      if (typeof Module2["preInit"] == "function")
        Module2["preInit"] = [Module2["preInit"]];
      while (Module2["preInit"].length > 0) {
        Module2["preInit"].pop()();
      }
    }
    run();
    (function() {
      const AsyncFunction3 = Object.getPrototypeOf(async function() {
      }).constructor;
      let pAsyncFlags = 0;
      Module2["set_authorizer"] = function(db, xAuthorizer, pApp) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xAuthorizer instanceof AsyncFunction3 ? 1 : 0, "i32");
        const result = ccall("libauthorizer_set_authorizer", "number", ["number", "number", "number"], [db, xAuthorizer ? 1 : 0, pAsyncFlags]);
        if (!result && xAuthorizer) {
          Module2["setCallback"](pAsyncFlags, (_, iAction, p3, p4, p5, p6) => xAuthorizer(pApp, iAction, p3, p4, p5, p6));
        }
        return result;
      };
    })();
    (function() {
      const AsyncFunction3 = Object.getPrototypeOf(async function() {
      }).constructor;
      const FUNC_METHODS = ["xFunc", "xStep", "xFinal"];
      const mapFunctionNameToKey = new Map;
      Module2["create_function"] = function(db, zFunctionName, nArg, eTextRep, pApp, xFunc, xStep, xFinal) {
        const pAsyncFlags = Module2["_sqlite3_malloc"](4);
        const target = { xFunc, xStep, xFinal };
        setValue(pAsyncFlags, FUNC_METHODS.reduce((mask, method, i) => {
          if (target[method] instanceof AsyncFunction3) {
            return mask | 1 << i;
          }
          return mask;
        }, 0), "i32");
        const result = ccall("libfunction_create_function", "number", ["number", "string", "number", "number", "number", "number", "number", "number"], [db, zFunctionName, nArg, eTextRep, pAsyncFlags, xFunc ? 1 : 0, xStep ? 1 : 0, xFinal ? 1 : 0]);
        if (!result) {
          if (mapFunctionNameToKey.has(zFunctionName)) {
            const oldKey = mapFunctionNameToKey.get(zFunctionName);
            Module2["deleteCallback"](oldKey);
          }
          mapFunctionNameToKey.set(zFunctionName, pAsyncFlags);
          Module2["setCallback"](pAsyncFlags, { xFunc, xStep, xFinal });
        }
        return result;
      };
    })();
    (function() {
      const AsyncFunction3 = Object.getPrototypeOf(async function() {
      }).constructor;
      let pAsyncFlags = 0;
      Module2["update_hook"] = function(db, xUpdateHook) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xUpdateHook instanceof AsyncFunction3 ? 1 : 0, "i32");
        ccall("libhook_update_hook", "void", ["number", "number", "number"], [db, xUpdateHook ? 1 : 0, pAsyncFlags]);
        if (xUpdateHook) {
          Module2["setCallback"](pAsyncFlags, (_, iUpdateType, dbName, tblName, lo32, hi32) => xUpdateHook(iUpdateType, dbName, tblName, lo32, hi32));
        }
      };
    })();
    (function() {
      const AsyncFunction3 = Object.getPrototypeOf(async function() {
      }).constructor;
      let pAsyncFlags = 0;
      Module2["commit_hook"] = function(db, xCommitHook) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xCommitHook instanceof AsyncFunction3 ? 1 : 0, "i32");
        ccall("libhook_commit_hook", "void", ["number", "number", "number"], [db, xCommitHook ? 1 : 0, pAsyncFlags]);
        if (xCommitHook) {
          Module2["setCallback"](pAsyncFlags, (_) => xCommitHook());
        }
      };
    })();
    (function() {
      const AsyncFunction3 = Object.getPrototypeOf(async function() {
      }).constructor;
      let pAsyncFlags = 0;
      Module2["progress_handler"] = function(db, nOps, xProgress, pApp) {
        if (pAsyncFlags) {
          Module2["deleteCallback"](pAsyncFlags);
          Module2["_sqlite3_free"](pAsyncFlags);
          pAsyncFlags = 0;
        }
        pAsyncFlags = Module2["_sqlite3_malloc"](4);
        setValue(pAsyncFlags, xProgress instanceof AsyncFunction3 ? 1 : 0, "i32");
        ccall("libprogress_progress_handler", "number", ["number", "number", "number", "number"], [db, nOps, xProgress ? 1 : 0, pAsyncFlags]);
        if (xProgress) {
          Module2["setCallback"](pAsyncFlags, (_) => xProgress(pApp));
        }
      };
    })();
    (function() {
      const VFS_METHODS = ["xOpen", "xDelete", "xAccess", "xFullPathname", "xRandomness", "xSleep", "xCurrentTime", "xGetLastError", "xCurrentTimeInt64", "xClose", "xRead", "xWrite", "xTruncate", "xSync", "xFileSize", "xLock", "xUnlock", "xCheckReservedLock", "xFileControl", "xSectorSize", "xDeviceCharacteristics", "xShmMap", "xShmLock", "xShmBarrier", "xShmUnmap"];
      const mapVFSNameToKey = new Map;
      Module2["vfs_register"] = function(vfs, makeDefault) {
        let methodMask = 0;
        let asyncMask = 0;
        VFS_METHODS.forEach((method, i) => {
          if (vfs[method]) {
            methodMask |= 1 << i;
            if (vfs["hasAsyncMethod"](method)) {
              asyncMask |= 1 << i;
            }
          }
        });
        const vfsReturn = Module2["_sqlite3_malloc"](4);
        try {
          const result = ccall("libvfs_vfs_register", "number", ["string", "number", "number", "number", "number", "number"], [vfs.name, vfs.mxPathname, methodMask, asyncMask, makeDefault ? 1 : 0, vfsReturn]);
          if (!result) {
            if (mapVFSNameToKey.has(vfs.name)) {
              const oldKey = mapVFSNameToKey.get(vfs.name);
              Module2["deleteCallback"](oldKey);
            }
            const key = getValue(vfsReturn, "*");
            mapVFSNameToKey.set(vfs.name, key);
            Module2["setCallback"](key, vfs);
          }
          return result;
        } finally {
          Module2["_sqlite3_free"](vfsReturn);
        }
      };
    })();
    moduleRtn = readyPromise;
    return moduleRtn;
  };
})();
var wa_sqlite_async_default = Module;

// src/web/wa-sqlite/wa-sqlite-async.wasm
var wa_sqlite_async_default2 = "./wa-sqlite-async-s8x1x2pg.wasm";

// src/web/worker.ts
var _sqlite3 = null;
var _vfs = null;
var _vfsMemory = null;
var databases = new Map;
var statements = new Map;
var nextStatementId = 1;
var VFS_NAME_PERSISTENT = "expo-sqlite";
var VFS_NAME_MEMORY = "expo-sqlite-memfs";
async function maybeInitAsync() {
  if (!_sqlite3) {
    const module = await wa_sqlite_async_default({
      locateFile: () => wa_sqlite_async_default2
    });
    _sqlite3 = Factory(module);
    if (!_sqlite3) {
      throw new Error("Failed to initialize wa-sqlite");
    }
    if (_vfs == null) {
      _vfs = await AccessHandlePoolVFS.create(VFS_NAME_PERSISTENT, module);
      if (_vfs == null) {
        throw new Error("Failed to initialize AccessHandlePoolVFS");
      }
    }
    _sqlite3.vfs_register(_vfs, true);
    if (_vfsMemory == null) {
      _vfsMemory = await MemoryVFS.create(VFS_NAME_MEMORY, module);
      if (_vfsMemory == null) {
        throw new Error("Failed to initialize MemoryVFS");
      }
    }
    _sqlite3.vfs_register(_vfsMemory, false);
  }
  return { sqlite3: _sqlite3, vfs: _vfs, vfsMemory: _vfsMemory };
}

class SQLiteErrorException extends Error {
}
async function openDatabase(databaseName) {
  const { sqlite3 } = await maybeInitAsync();
  const flags = SQLITE_OPEN_READWRITE | SQLITE_OPEN_CREATE;
  const vfsName = databaseName === ":memory:" ? VFS_NAME_MEMORY : VFS_NAME_PERSISTENT;
  const db = await sqlite3.open_v2(databaseName, flags, vfsName);
  databases.set(databaseName, db);
}
async function isInTransaction(databaseName) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  return sqlite3.get_autocommit(db) === 0;
}
async function closeDatabase(databaseName) {
  const { sqlite3, vfs } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (db) {
    await sqlite3.close(db);
    databases.delete(databaseName);
    if (databaseName !== ":memory:") {
      await vfs.closeFile(databaseName);
    }
  }
}
async function exec(databaseName, source) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  await sqlite3.exec(db, source);
}
async function prepare(databaseName, source) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  const asyncIterable = sqlite3.statements(db, source, { unscoped: true });
  const asyncIterator = asyncIterable[Symbol.asyncIterator]();
  try {
    const { value: statement } = await asyncIterator.next();
    if (!statement)
      throw new Error("Failed to prepare statement");
    const statementId = nextStatementId++;
    statements.set(statementId, statement);
    return { statementId };
  } catch (e) {
    throw new Error("Failed to prepare statement", { cause: e });
  }
}
function getBindParamIndex(sqlite3, stmt, key, shouldPassAsArray) {
  let index;
  if (shouldPassAsArray) {
    const intKey = parseInt(key, 10);
    if (isNaN(intKey)) {
      throw new Error("Invalid bind parameter");
    }
    index = intKey + 1;
  } else {
    index = sqlite3.bind_parameter_index(stmt, key);
  }
  return index;
}
function bindStatementParam(sqlite3, stmt, param, index) {
  if (param == null) {
    sqlite3.bind_null(stmt, index);
  } else if (typeof param === "number") {
    if (Number.isInteger(param)) {
      sqlite3.bind_int(stmt, index, param);
    } else {
      sqlite3.bind_double(stmt, index, param);
    }
  } else if (typeof param === "string") {
    sqlite3.bind_text(stmt, index, param);
  } else if (param instanceof Uint8Array) {
    sqlite3.bind_blob(stmt, index, param);
  } else if (typeof param === "boolean") {
    sqlite3.bind_int(stmt, index, param ? 1 : 0);
  } else {
    throw new Error(`Unsupported parameter type: ${typeof param}`);
  }
}
function getColumnValues(sqlite3, stmt) {
  const columnCount = sqlite3.column_count(stmt);
  const columnValues = [];
  for (let i = 0;i < columnCount; i++) {
    columnValues[i] = getColumnValue(sqlite3, stmt, i);
  }
  return columnValues;
}
function getColumnValue(sqlite3, stmt, index) {
  const type = sqlite3.column_type(stmt, index);
  let value;
  switch (type) {
    case SQLITE_INTEGER: {
      value = sqlite3.column_int(stmt, index);
      break;
    }
    case SQLITE_FLOAT: {
      value = sqlite3.column_double(stmt, index);
      break;
    }
    case SQLITE_TEXT: {
      value = sqlite3.column_text(stmt, index);
      break;
    }
    case SQLITE_BLOB: {
      value = sqlite3.column_blob(stmt, index);
      break;
    }
    case SQLITE_NULL: {
      value = null;
      break;
    }
    default: {
      throw new Error(`Unsupported column type: ${type}`);
    }
  }
  return value;
}
async function run(databaseName, statementId, bindParams, bindBlobParams, shouldPassAsArray) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  const stmt = statements.get(statementId);
  if (!stmt)
    throw new Error(`Statement ${statementId} not found`);
  sqlite3.reset(stmt);
  sqlite3.clear_bindings(stmt);
  for (const [key, param] of Object.entries(bindParams)) {
    const index = getBindParamIndex(sqlite3, stmt, key, shouldPassAsArray);
    if (index > 0) {
      bindStatementParam(sqlite3, stmt, param, index);
    }
  }
  for (const [key, param] of Object.entries(bindBlobParams)) {
    const index = getBindParamIndex(sqlite3, stmt, key, shouldPassAsArray);
    if (index > 0) {
      bindStatementParam(sqlite3, stmt, param, index);
    }
  }
  const ret = await sqlite3.step(stmt);
  if (ret !== SQLITE_ROW && ret !== SQLITE_DONE) {
    throw new SQLiteErrorException("Error executing statement");
  }
  return {
    lastInsertRowId: Number(sqlite3.last_insert_rowid(db)),
    changes: sqlite3.changes(db),
    firstRowValues: ret === SQLITE_ROW ? getColumnValues(sqlite3, stmt) : []
  };
}
async function step(databaseName, statementId) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  const stmt = statements.get(statementId);
  if (!stmt)
    throw new Error(`Statement ${statementId} not found`);
  const ret = await sqlite3.step(stmt);
  if (ret === SQLITE_ROW) {
    return getColumnValues(sqlite3, stmt);
  }
  if (ret !== SQLITE_DONE) {
    throw new Error("Error executing statement");
  }
  return null;
}
async function getAllRows(databaseName, statementId) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  const stmt = statements.get(statementId);
  if (!stmt)
    throw new Error(`Statement ${statementId} not found`);
  const rows = [];
  while (true) {
    const ret = await sqlite3.step(stmt);
    if (ret === SQLITE_ROW) {
      rows.push(getColumnValues(sqlite3, stmt));
      continue;
    } else if (ret === SQLITE_DONE) {
      break;
    }
    throw new Error("Error executing statement");
  }
  return rows;
}
async function reset(databaseName, statementId) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  const stmt = statements.get(statementId);
  if (!stmt)
    throw new Error(`Statement ${statementId} not found`);
  if (await sqlite3.reset(stmt) !== SQLITE_OK) {
    throw new Error("Error resetting statement");
  }
}
async function getColumnNames(statementId) {
  const { sqlite3 } = await maybeInitAsync();
  const stmt = statements.get(statementId);
  if (!stmt)
    throw new Error(`Statement ${statementId} not found`);
  const columnCount = sqlite3.column_count(stmt);
  const columnNames = [];
  for (let i = 0;i < columnCount; i++) {
    columnNames.push(sqlite3.column_name(stmt, i));
  }
  return columnNames;
}
async function finalize(databaseName, statementId) {
  const { sqlite3 } = await maybeInitAsync();
  const db = databases.get(databaseName);
  if (!db)
    throw new Error(`Database ${databaseName} not found`);
  const stmt = statements.get(statementId);
  if (!stmt)
    throw new Error(`Statement ${statementId} not found`);
  if (await sqlite3.finalize(stmt) !== SQLITE_OK) {
    throw new Error("Error finalizing statement");
  }
  statements.delete(statementId);
}
async function deleteDatabase(databaseName) {
  const { vfs } = await maybeInitAsync();
  if (databaseName !== ":memory:") {
    vfs.jDelete(databaseName, 0);
  }
}
async function handleMessageImpl({
  type,
  data
}) {
  let result;
  switch (type) {
    case "open": {
      await openDatabase(data.databaseName);
      break;
    }
    case "isInTransaction": {
      result = await isInTransaction(data.databaseName);
      break;
    }
    case "close": {
      await closeDatabase(data.databaseName);
      break;
    }
    case "exec": {
      await exec(data.databaseName, data.source);
      break;
    }
    case "prepare": {
      result = await prepare(data.databaseName, data.source);
      break;
    }
    case "run": {
      result = await run(data.databaseName, data.statementId, data.bindParams, data.bindBlobParams, data.shouldPassAsArray);
      break;
    }
    case "step": {
      result = await step(data.databaseName, data.statementId);
      break;
    }
    case "getAll": {
      result = await getAllRows(data.databaseName, data.statementId);
      break;
    }
    case "reset": {
      await reset(data.databaseName, data.statementId);
      break;
    }
    case "getColumnNames": {
      result = await getColumnNames(data.statementId);
      break;
    }
    case "finalize": {
      await finalize(data.databaseName, data.statementId);
      break;
    }
    case "deleteDatabase": {
      await deleteDatabase(data.databaseName);
      break;
    }
    default: {
      throw new Error(`Unknown message type: ${type}`);
    }
  }
  return result;
}
self.onmessage = async (event) => {
  let result = null;
  let error = null;
  try {
    const message = event.data;
    result = await handleMessageImpl(message);
  } catch (e) {
    error = e instanceof Error ? e : new Error(String(e));
  }
  const syncTrait = event.data.isSync ? {
    lockBuffer: event.data.lockBuffer,
    resultBuffer: event.data.resultBuffer
  } : undefined;
  sendWorkerResult({
    id: event.data.id,
    result,
    error,
    syncTrait
  });
};
