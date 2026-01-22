interface JoinRoomFeatureProps {
  roomId: string
  onJoinRoom: (roomId: string) => void
  children?: React.ReactNode
}

export function JoinRoomFeature({ roomId, onJoinRoom, children }: JoinRoomFeatureProps) {
  const handleJoinRoom = () => {
    onJoinRoom(roomId)
  }

  // This component acts as a feature wrapper
  // The actual UI is provided via children or render props pattern
  if (children) {
    return (
      <div onClick={handleJoinRoom}>
        {children}
      </div>
    )
  }

  return (
    <button
      onClick={handleJoinRoom}
      className="w-full text-left hover:bg-gray-50 transition-colors"
      type="button"
    >
      방에 참여하기
    </button>
  )
}