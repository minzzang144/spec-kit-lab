/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { SocketProvider } from './socket-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </QueryProvider>
  )
}

export { SocketProvider } from './socket-provider'
export { QueryProvider } from './query-provider'
export { useSocket } from './socket-hooks'
export { queryClient } from './query-client'
export default Providers