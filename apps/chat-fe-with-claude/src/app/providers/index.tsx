/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { SocketProvider } from './socket-provider'
import { ErrorBoundary, ToastProvider } from '@/shared/ui'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <QueryProvider>
          <SocketProvider>
            {children}
          </SocketProvider>
        </QueryProvider>
      </ToastProvider>
    </ErrorBoundary>
  )
}

export { SocketProvider } from './socket-provider'
export { QueryProvider } from './query-provider'
export { useSocket } from './socket-hooks'
export { queryClient } from './query-client'
export { useToast } from '@/shared/ui'
export default Providers