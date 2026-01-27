import { Providers } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { NetworkStatusIndicator } from '@/shared/ui'

function App() {
  return (
    <Providers>
      <NetworkStatusIndicator />
      <AppRouter />
    </Providers>
  )
}

export default App
