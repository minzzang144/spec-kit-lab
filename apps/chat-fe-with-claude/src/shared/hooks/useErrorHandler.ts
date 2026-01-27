import { useCallback } from 'react'
import { useToast } from '@/shared/ui'

export interface ErrorInfo {
  message: string
  code?: string
  statusCode?: number
  canRetry?: boolean
}

export function useErrorHandler() {
  const toast = useToast()

  const handleError = useCallback(
    (error: unknown, context?: string, onRetry?: () => void) => {
      console.error(`Error${context ? ` in ${context}` : ''}:`, error)

      const errorInfo: ErrorInfo = {
        message: '알 수 없는 오류가 발생했습니다.',
        canRetry: true,
      }

      // Parse different error types
      if (error instanceof Error) {
        errorInfo.message = error.message
      } else if (typeof error === 'string') {
        errorInfo.message = error
      } else if (typeof error === 'object' && error !== null) {
        const errorObj = error as Record<string, unknown>

        if (errorObj.response && typeof errorObj.response === 'object') {
          // Axios error format
          const response = errorObj.response as Record<string, unknown>
          const status = response.status as number
          const data = response.data as Record<string, unknown>
          errorInfo.statusCode = status
          errorInfo.message = data?.message as string || `서버 오류 (${status})`

          if (status >= 400 && status < 500) {
            errorInfo.canRetry = status === 408 || status === 429 // Timeout or rate limited
          }
        } else if (errorObj.status && typeof errorObj.status === 'number') {
          // Fetch error format
          errorInfo.statusCode = errorObj.status
          errorInfo.message = errorObj.message as string || `요청 실패 (${errorObj.status})`
        } else if (errorObj.message && typeof errorObj.message === 'string') {
          errorInfo.message = errorObj.message
        }

        if (errorObj.code && typeof errorObj.code === 'string') {
          errorInfo.code = errorObj.code
        }
      }

      // Handle specific error types
      if (errorInfo.statusCode) {
        switch (errorInfo.statusCode) {
          case 401:
            errorInfo.message = '인증이 필요합니다. 다시 로그인해주세요.'
            errorInfo.canRetry = false
            break
          case 403:
            errorInfo.message = '접근 권한이 없습니다.'
            errorInfo.canRetry = false
            break
          case 404:
            errorInfo.message = '요청한 리소스를 찾을 수 없습니다.'
            errorInfo.canRetry = false
            break
          case 408:
            errorInfo.message = '요청 시간이 초과되었습니다.'
            break
          case 429:
            errorInfo.message = '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.'
            break
          case 500:
            errorInfo.message = '서버 내부 오류가 발생했습니다.'
            break
          case 502:
            errorInfo.message = '서버에 연결할 수 없습니다.'
            break
          case 503:
            errorInfo.message = '서비스를 일시적으로 사용할 수 없습니다.'
            break
        }
      }

      // Handle network errors
      if (errorInfo.message.includes('Network Error') || errorInfo.message.includes('Failed to fetch')) {
        errorInfo.message = '네트워크 연결을 확인해주세요.'
        errorInfo.canRetry = true
      }

      // Show toast with retry option if available
      const actions = errorInfo.canRetry && onRetry
        ? [{ label: '다시 시도', onClick: onRetry }]
        : undefined

      toast.addToast({
        type: 'error',
        title: context ? `${context} 오류` : '오류',
        message: errorInfo.message,
        duration: 7000,
        actions,
      })

      return errorInfo
    },
    [toast]
  )

  const handleNetworkError = useCallback(
    (error: unknown, onRetry?: () => void) => {
      return handleError(error, '네트워크', onRetry)
    },
    [handleError]
  )

  const handleApiError = useCallback(
    (error: unknown, endpoint?: string, onRetry?: () => void) => {
      const context = endpoint ? `API (${endpoint})` : 'API'
      return handleError(error, context, onRetry)
    },
    [handleError]
  )

  const handleSocketError = useCallback(
    (error: unknown, event?: string) => {
      const context = event ? `Socket (${event})` : 'Socket'
      return handleError(error, context)
    },
    [handleError]
  )

  return {
    handleError,
    handleNetworkError,
    handleApiError,
    handleSocketError,
  }
}