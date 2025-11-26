import { createContext } from 'react'
import type { AiutaAppRpc } from '@lib/rpc'

export const RpcContext = createContext<AiutaAppRpc | undefined>(undefined)
