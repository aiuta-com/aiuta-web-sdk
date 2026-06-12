/**
 * Module-level seam between the RPC layer and the storage/query providers.
 *
 * The RPC handlers are registered in RpcInitializer, which mounts ABOVE
 * StorageProvider/QueryProvider, so the clearStorage handler cannot reach
 * the storage backend or the query client directly. Instead it delegates
 * here, and ClearStorageBridge (mounted inside all providers) registers
 * the actual implementation.
 */

type ClearStorageImpl = () => Promise<void>

// The RPC connection comes up before the provider tree finishes mounting
// (storage adapter creation is async), so a clearStorage call right after
// connect must wait for the implementation to be registered.
const REGISTRATION_TIMEOUT_MS = 10_000

let impl: ClearStorageImpl | null = null
let waiters: Array<(fn: ClearStorageImpl) => void> = []

export const registerClearStorage = (fn: ClearStorageImpl | null) => {
  impl = fn
  if (fn) {
    const pending = waiters
    waiters = []
    pending.forEach((resolve) => resolve(fn))
  }
}

const waitForImpl = (): Promise<ClearStorageImpl> => {
  if (impl) return Promise.resolve(impl)

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      waiters = waiters.filter((waiter) => waiter !== onRegistered)
      reject(new Error('clearStorage is not available: the app did not finish initializing'))
    }, REGISTRATION_TIMEOUT_MS)

    const onRegistered = (fn: ClearStorageImpl) => {
      clearTimeout(timer)
      resolve(fn)
    }

    waiters.push(onRegistered)
  })
}

export const runClearStorage = async (): Promise<void> => {
  const fn = await waitForImpl()
  await fn()
}
