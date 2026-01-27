import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '@/shared/constants'

// Lazy load pages for better performance
import { lazy, Suspense } from 'react'

const NicknameSetupPage = lazy(() => import('@/pages/nickname-setup'))
const LobbyPage = lazy(() => import('@/pages/lobby'))
const ChatRoomPage = lazy(() => import('@/pages/chat-room'))
const ErrorPage = lazy(() => import('@/pages/error'))

// Loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 로드하고 있습니다...</p>
      </div>
    </div>
  )
}

// Wrapper component for Suspense
function SuspensePage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<PageLoader />}>
      {children}
    </Suspense>
  )
}

const router = createBrowserRouter([
  {
    path: ROUTES.NICKNAME_SETUP,
    element: (
      <SuspensePage>
        <NicknameSetupPage />
      </SuspensePage>
    ),
    errorElement: (
      <SuspensePage>
        <ErrorPage />
      </SuspensePage>
    ),
  },
  {
    path: ROUTES.LOBBY,
    element: (
      <SuspensePage>
        <LobbyPage />
      </SuspensePage>
    ),
  },
  {
    path: ROUTES.CHAT_ROOM,
    element: (
      <SuspensePage>
        <ChatRoomPage />
      </SuspensePage>
    ),
  },
  {
    path: ROUTES.ERROR,
    element: (
      <SuspensePage>
        <ErrorPage />
      </SuspensePage>
    ),
  },
  {
    path: '*',
    element: (
      <SuspensePage>
        <ErrorPage />
      </SuspensePage>
    ),
  },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

export default AppRouter