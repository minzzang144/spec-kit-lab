// Shared UI Components
export { ErrorBoundary } from './ErrorBoundary'
export { LoadingSpinner, LoadingOverlay, PageLoadingSpinner } from './LoadingSpinner'
export { ErrorMessage, FullScreenError } from './ErrorMessage'
export { ToastProvider, useToast } from './Toast'
export type { Toast, ToastType } from './Toast'
export { LoadingButton } from './LoadingButton'
export { EmptyState, EmptyStates } from './EmptyState'

// Legacy exports (to be deprecated)
export const UI_COMPONENTS = {
  BUTTON: 'button',
  INPUT: 'input',
  CARD: 'div',
} as const