// Backends
export type { IStorageBackend, PredefinedModelsCache } from './backends/IStorageBackend'
export { LocalStorageBackend } from './backends/LocalStorageBackend'
export { RpcStorageBackend } from './backends/RpcStorageBackend'

// Adapters (internal use)
export type { IStorageAdapter } from './adapters/IStorageAdapter'
export { createStorageAdapter } from './adapters/createStorageAdapter'
