import { useState, useCallback } from 'react'
import { useMutation } from '@tanstack/react-query'
import { validateNickname, type NicknameValidationResult } from '../model/nicknameValidation'
import { generateRandomNickname } from '../model/nicknameGenerator'
import { nicknameApi, type CreateUserResponse } from '../api/nicknameApi'
import { SessionManager } from '@/shared/lib/session-manager'
import { UserModel } from '@/entities/user/model'

export interface NicknameSetupState {
  nickname: string
  validationResult: NicknameValidationResult | null
  isCheckingAvailability: boolean
  isCreatingUser: boolean
  error: string | null
}

export function useNicknameSetup() {
  const [state, setState] = useState<NicknameSetupState>({
    nickname: '',
    validationResult: null,
    isCheckingAvailability: false,
    isCreatingUser: false,
    error: null,
  })

  // Set nickname and validate
  const setNickname = useCallback((nickname: string) => {
    const validationResult = validateNickname(nickname)
    setState(prev => ({
      ...prev,
      nickname,
      validationResult,
      error: null,
    }))
  }, [])

  // Generate random nickname
  const generateNickname = useCallback(() => {
    const randomNickname = generateRandomNickname()
    setNickname(randomNickname)
  }, [setNickname])

  // Check nickname availability
  const checkAvailability = useCallback(async (nickname: string) => {
    if (!nickname.trim()) return

    setState(prev => ({ ...prev, isCheckingAvailability: true, error: null }))

    try {
      const result = await nicknameApi.checkNicknameAvailability(nickname)

      if (!result.isAvailable) {
        setState(prev => ({
          ...prev,
          isCheckingAvailability: false,
          validationResult: {
            isValid: false,
            error: result.message || '이미 사용중인 닉네임입니다.'
          }
        }))
      } else {
        setState(prev => ({
          ...prev,
          isCheckingAvailability: false,
        }))
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isCheckingAvailability: false,
        error: '닉네임 확인 중 오류가 발생했습니다.'
      }))
    }
  }, [])

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (nickname: string): Promise<CreateUserResponse> => {
      return nicknameApi.createUser({ nickname })
    },
    onMutate: () => {
      setState(prev => ({ ...prev, isCreatingUser: true, error: null }))
    },
    onSuccess: (response) => {
      // Create user model and save to session
      const user = UserModel.create({
        id: response.id,
        nickname: response.nickname,
        socketId: response.socketId,
      })

      SessionManager.save({
        userId: user.id,
        nickname: user.nickname,
        socketId: user.socketId,
        createdAt: response.createdAt,
      })

      setState(prev => ({ ...prev, isCreatingUser: false }))
    },
    onError: (error) => {
      setState(prev => ({
        ...prev,
        isCreatingUser: false,
        error: error instanceof Error ? error.message : '사용자 생성 중 오류가 발생했습니다.'
      }))
    },
  })

  // Submit nickname
  const submitNickname = useCallback(async (nickname: string) => {
    const validationResult = validateNickname(nickname)

    if (!validationResult.isValid) {
      setState(prev => ({ ...prev, validationResult }))
      return false
    }

    try {
      await createUserMutation.mutateAsync(nickname)
      return true
    } catch {
      return false
    }
  }, [createUserMutation])

  return {
    ...state,
    setNickname,
    generateNickname,
    checkAvailability,
    submitNickname,
    canSubmit: state.validationResult?.isValid === true &&
                !state.isCheckingAvailability &&
                !state.isCreatingUser,
  }
}