import { useState, useCallback } from 'react'

export interface LoadingState {
  [key: string]: boolean
}

export interface LoadingActions {
  setLoading: (key: string, loading: boolean) => void
  startLoading: (key: string) => void
  stopLoading: (key: string) => void
  isLoading: (key?: string) => boolean
  getLoadingState: (key: string) => boolean
  clearAll: () => void
}

/**
 * 여러 비동기 작업의 로딩 상태를 관리하는 훅
 */
export function useLoadingState(initialState: LoadingState = {}): LoadingActions {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(initialState)

  const setLoading = useCallback((key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading,
    }))
  }, [])

  const startLoading = useCallback((key: string) => {
    setLoading(key, true)
  }, [setLoading])

  const stopLoading = useCallback((key: string) => {
    setLoading(key, false)
  }, [setLoading])

  const isLoading = useCallback((key?: string) => {
    if (key) {
      return loadingStates[key] ?? false
    }
    // If no key provided, check if any operation is loading
    return Object.values(loadingStates).some(loading => loading)
  }, [loadingStates])

  const getLoadingState = useCallback((key: string) => {
    return loadingStates[key] ?? false
  }, [loadingStates])

  const clearAll = useCallback(() => {
    setLoadingStates({})
  }, [])

  return {
    setLoading,
    startLoading,
    stopLoading,
    isLoading,
    getLoadingState,
    clearAll,
  }
}

/**
 * 단일 비동기 작업의 로딩 상태를 관리하는 간단한 훅
 */
export function useSimpleLoading(initialLoading = false) {
  const [loading, setLoading] = useState(initialLoading)

  const startLoading = useCallback(() => setLoading(true), [])
  const stopLoading = useCallback(() => setLoading(false), [])

  const withLoading = useCallback(async <T>(
    operation: () => Promise<T>
  ): Promise<T> => {
    try {
      startLoading()
      const result = await operation()
      return result
    } finally {
      stopLoading()
    }
  }, [startLoading, stopLoading])

  return {
    loading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}