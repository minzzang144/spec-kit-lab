import { useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Loader, MessageSquare } from 'lucide-react'
import { useCreateRoomFlow } from '../hooks/useCreateRoomFlow'

interface CreateRoomModalProps {
  isOpen: boolean
  onClose: () => void
  currentUserId: string | null
  currentUserNickname?: string | null
  onRoomCreated?: (roomId: string) => void
}

export const CreateRoomModal = ({
  isOpen,
  onClose,
  currentUserId,
  currentUserNickname,
  onRoomCreated,
}: CreateRoomModalProps) => {
  const createRoomFlow = useCreateRoomFlow({
    onRoomCreated: (room) => {
      onRoomCreated?.(room.id)
    },
    onFlowComplete: () => {
      onClose()
    },
    autoNavigate: true,
  })

  const { state, error, createdRoom, createRoom, dismiss } = createRoomFlow

  const handleCreateRoom = async () => {
    if (!currentUserId) {
      return
    }
    await createRoom(currentUserId)
  }

  const handleClose = () => {
    if (state === 'creating') {
      return // Prevent closing while creating
    }
    dismiss()
    onClose()
  }

  // Close modal on successful navigation (after delay)
  useEffect(() => {
    if (state === 'success' && createdRoom) {
      const timer = setTimeout(() => {
        onClose()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state, createdRoom, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">새 채팅방 만들기</h2>
          {state !== 'creating' && (
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="text-center">
          {/* User info */}
          {currentUserNickname && (
            <div className="mb-6 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">생성자</p>
              <p className="font-medium text-gray-900">{currentUserNickname}</p>
            </div>
          )}

          {/* State-based content */}
          {state === 'idle' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-gray-600 mb-6">
                새로운 채팅방을 만들고 대화를 시작해보세요!
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  disabled={!currentUserId}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  채팅방 만들기
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {state === 'creating' && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <p className="text-gray-900 font-medium">채팅방을 생성하는 중...</p>
              <p className="text-gray-500 text-sm">잠시만 기다려주세요</p>
            </div>
          )}

          {state === 'success' && createdRoom && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-green-900 font-medium">채팅방이 생성되었습니다!</p>
              <div className="bg-green-50 rounded-lg p-3">
                <p className="text-green-800 font-medium">{createdRoom.name}</p>
                <p className="text-green-600 text-sm">자동으로 입장합니다...</p>
              </div>
            </div>
          )}

          {state === 'error' && error && (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
              </div>
              <p className="text-red-900 font-medium">채팅방 생성에 실패했습니다</p>
              <p className="text-red-600 text-sm">{error.message}</p>
              <div className="space-y-3">
                <button
                  onClick={handleCreateRoom}
                  disabled={!currentUserId}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium transition-colors"
                >
                  다시 시도
                </button>
                <button
                  onClick={handleClose}
                  className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          )}

          {/* User validation message */}
          {!currentUserId && state === 'idle' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                채팅방을 만들려면 먼저 닉네임을 설정해주세요.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateRoomModal