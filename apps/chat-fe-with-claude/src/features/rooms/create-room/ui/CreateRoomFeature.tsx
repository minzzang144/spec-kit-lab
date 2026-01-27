import { useState } from 'react'
import { CreateRoomButton } from './CreateRoomButton'
import { CreateRoomModal } from './CreateRoomModal'

interface CreateRoomFeatureProps {
  currentUserId: string | null
  currentUserNickname?: string | null
  onRoomCreated?: (roomId: string) => void
  buttonVariant?: 'primary' | 'secondary'
  buttonSize?: 'sm' | 'md' | 'lg'
  className?: string
}

export const CreateRoomFeature = ({
  currentUserId,
  currentUserNickname,
  onRoomCreated,
  buttonVariant = 'primary',
  buttonSize = 'md',
  className,
}: CreateRoomFeatureProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenModal = () => {
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleRoomCreated = (roomId: string) => {
    onRoomCreated?.(roomId)
    setIsModalOpen(false)
  }

  return (
    <div className={className}>
      <CreateRoomButton
        onClick={handleOpenModal}
        disabled={!currentUserId}
        variant={buttonVariant}
        size={buttonSize}
      />

      <CreateRoomModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        currentUserId={currentUserId}
        currentUserNickname={currentUserNickname}
        onRoomCreated={handleRoomCreated}
      />
    </div>
  )
}

export default CreateRoomFeature