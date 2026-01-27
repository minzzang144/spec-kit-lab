import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ChatRoom, RoomSummary, CreateRoomPayload, JoinRoomPayload } from '../model'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// API client functions
const roomsApi = {
  // Get all rooms
  getRooms: async (): Promise<RoomSummary[]> => {
    const response = await fetch(`${API_BASE_URL}/rooms`)
    if (!response.ok) {
      throw new Error('Failed to fetch rooms')
    }
    return response.json()
  },

  // Get room by ID with full details
  getRoomById: async (roomId: string): Promise<ChatRoom> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Room not found')
      }
      throw new Error('Failed to fetch room details')
    }
    return response.json()
  },

  // Create new room
  createRoom: async (payload: CreateRoomPayload): Promise<ChatRoom> => {
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      throw new Error('Failed to create room')
    }
    return response.json()
  },

  // Join room
  joinRoom: async (roomId: string, payload: JoinRoomPayload): Promise<ChatRoom> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      if (response.status === 400) {
        throw new Error('Unable to join room - may be full or not found')
      }
      throw new Error('Failed to join room')
    }
    return response.json()
  },

  // Leave room
  leaveRoom: async (roomId: string, userId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/leave`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })
    if (!response.ok) {
      throw new Error('Failed to leave room')
    }
  },
}

// Query keys for cache management
export const roomsQueryKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomsQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...roomsQueryKeys.lists(), filters] as const,
  details: () => [...roomsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomsQueryKeys.details(), id] as const,
}

// React Query hooks
export const useRoomsQuery = () => {
  return useQuery({
    queryKey: roomsQueryKeys.lists(),
    queryFn: roomsApi.getRooms,
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
    staleTime: 3000, // Consider data stale after 3 seconds
  })
}

export const useRoomQuery = (roomId: string | null) => {
  return useQuery({
    queryKey: roomsQueryKeys.detail(roomId || ''),
    queryFn: () => roomsApi.getRoomById(roomId!),
    enabled: !!roomId,
    staleTime: 10000, // Room details stay fresh for 10 seconds
  })
}

export const useCreateRoomMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: roomsApi.createRoom,
    onSuccess: (newRoom) => {
      // Invalidate and refetch rooms list
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.lists() })

      // Add the new room to cache
      queryClient.setQueryData(roomsQueryKeys.detail(newRoom.id), newRoom)
    },
    onError: (error) => {
      console.error('Failed to create room:', error)
    },
  })
}

export const useJoinRoomMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, payload }: { roomId: string; payload: JoinRoomPayload }) =>
      roomsApi.joinRoom(roomId, payload),
    onSuccess: (updatedRoom) => {
      // Update both room details and rooms list
      queryClient.setQueryData(roomsQueryKeys.detail(updatedRoom.id), updatedRoom)
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to join room:', error)
    },
  })
}

export const useLeaveRoomMutation = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ roomId, userId }: { roomId: string; userId: string }) =>
      roomsApi.leaveRoom(roomId, userId),
    onSuccess: (_, { roomId }) => {
      // Invalidate room details and rooms list
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.detail(roomId) })
      queryClient.invalidateQueries({ queryKey: roomsQueryKeys.lists() })
    },
    onError: (error) => {
      console.error('Failed to leave room:', error)
    },
  })
}

// Export the raw API client for direct use if needed
export { roomsApi }