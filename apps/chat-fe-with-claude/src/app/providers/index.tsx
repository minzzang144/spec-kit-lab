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

export { SocketProvider, useSocket } from './socket-provider'
export { QueryProvider } from './query-provider'
export default Providers