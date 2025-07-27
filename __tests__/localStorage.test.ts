/**
 * localStorage機能のユニットテスト
 * ルーム共有機能の核となるデータ永続化機能をテスト
 */

import { Room, Message } from '@/types'
import { Timestamp } from 'firebase/firestore'

// localStorage関数をテスト用に抽出
const STORAGE_KEY = 'chat-app-mock-rooms'
const STORAGE_MESSAGES_KEY = 'chat-app-mock-messages'

const getStoredRooms = (): Room[] => {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsedRooms = JSON.parse(stored)
      return parsedRooms.map((room: any) => ({
        ...room,
        createdAt: new Date(room.createdAt) as unknown as Timestamp,
      }))
    }
  } catch (error) {
    console.error('Failed to load rooms from localStorage:', error)
  }
  return []
}

const saveRoomsToStorage = (rooms: Room[]): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rooms))
  } catch (error) {
    console.error('Failed to save rooms to localStorage:', error)
  }
}

const getStoredMessages = (): Record<string, Message[]> => {
  if (typeof window === 'undefined') return {}
  
  try {
    const stored = localStorage.getItem(STORAGE_MESSAGES_KEY)
    if (stored) {
      const parsedMessages = JSON.parse(stored)
      const restoredMessages: Record<string, Message[]> = {}
      Object.keys(parsedMessages).forEach(roomId => {
        restoredMessages[roomId] = parsedMessages[roomId].map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt) as unknown as Timestamp,
          ...(msg.deletedAt && { deletedAt: new Date(msg.deletedAt) as unknown as Timestamp }),
        }))
      })
      return restoredMessages
    }
  } catch (error) {
    console.error('Failed to load messages from localStorage:', error)
  }
  return {}
}

const saveMessagesToStorage = (messages: Record<string, Message[]>): void => {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_MESSAGES_KEY, JSON.stringify(messages))
  } catch (error) {
    console.error('Failed to save messages to localStorage:', error)
  }
}

describe('localStorage Functions', () => {
  // Mock data
  const mockRoom: Room = {
    roomId: 'test-room-1',
    ownerUid: 'test-user-1',
    title: 'Test Room',
    notice: 'Test notice',
    visibility: 'public',
    chatType: '1vN',
    participants: ['test-user-1'],
    aiProxyEnabled: true,
    aiProxyConfig: {
      timeoutSecs: 30,
      keywords: ['test'],
      model: 'gpt-4o-mini',
    },
    createdAt: new Date('2024-01-01T00:00:00Z') as unknown as Timestamp,
    isActive: true,
    isClosed: false,
  }

  const mockMessage: Message = {
    msgId: 'test-msg-1',
    roomId: 'test-room-1',
    senderUid: 'test-user-1',
    text: 'Test message',
    createdAt: new Date('2024-01-01T00:00:00Z') as unknown as Timestamp,
    isDeleted: false,
    isAiGenerated: false,
  }

  beforeEach(() => {
    // Mock functions are already set up in jest.setup.js
    // Just clear any previous call history
    jest.clearAllMocks()
  })

  describe('Room Storage Functions', () => {
    test('saveRoomsToStorage should save rooms to localStorage', () => {
      const rooms = [mockRoom]
      
      saveRoomsToStorage(rooms)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(rooms)
      )
    })

    test('getStoredRooms should return empty array when no data exists', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      const result = getStoredRooms()
      
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
      expect(result).toEqual([])
    })

    test('getStoredRooms should return parsed rooms when data exists', () => {
      const storedData = JSON.stringify([mockRoom])
      ;(localStorage.getItem as jest.Mock).mockReturnValue(storedData)
      
      const result = getStoredRooms()
      
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY)
      expect(result).toHaveLength(1)
      expect(result[0].roomId).toBe('test-room-1')
      expect(result[0].title).toBe('Test Room')
    })

    test('getStoredRooms should handle JSON parse errors gracefully', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid-json')
      
      const result = getStoredRooms()
      
      expect(result).toEqual([])
    })
  })

  describe('Message Storage Functions', () => {
    test('saveMessagesToStorage should save messages to localStorage', () => {
      const messages = { 'test-room-1': [mockMessage] }
      
      saveMessagesToStorage(messages)
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_MESSAGES_KEY,
        JSON.stringify(messages)
      )
    })

    test('getStoredMessages should return empty object when no data exists', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue(null)
      
      const result = getStoredMessages()
      
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_MESSAGES_KEY)
      expect(result).toEqual({})
    })

    test('getStoredMessages should return parsed messages when data exists', () => {
      const storedData = JSON.stringify({ 'test-room-1': [mockMessage] })
      ;(localStorage.getItem as jest.Mock).mockReturnValue(storedData)
      
      const result = getStoredMessages()
      
      expect(localStorage.getItem).toHaveBeenCalledWith(STORAGE_MESSAGES_KEY)
      expect(result['test-room-1']).toHaveLength(1)
      expect(result['test-room-1'][0].msgId).toBe('test-msg-1')
      expect(result['test-room-1'][0].text).toBe('Test message')
    })

    test('getStoredMessages should handle JSON parse errors gracefully', () => {
      ;(localStorage.getItem as jest.Mock).mockReturnValue('invalid-json')
      
      const result = getStoredMessages()
      
      expect(result).toEqual({})
    })
  })

  describe('Cross-Session Data Sharing Simulation', () => {
    test('should simulate room sharing between different browser sessions', () => {
      // Session 1: User1 creates a room
      const user1Room = { ...mockRoom, ownerUid: 'user1@example.com' }
      saveRoomsToStorage([user1Room])
      
      // Verify room was saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([user1Room])
      )
      
      // Session 2: User2 loads rooms
      const storedData = JSON.stringify([user1Room])
      ;(localStorage.getItem as jest.Mock).mockReturnValue(storedData)
      
      const loadedRooms = getStoredRooms()
      
      // Verify User2 can see User1's room
      expect(loadedRooms).toHaveLength(1)
      expect(loadedRooms[0].ownerUid).toBe('user1@example.com')
      expect(loadedRooms[0].title).toBe('Test Room')
      expect(loadedRooms[0].visibility).toBe('public')
    })

    test('should simulate message sharing between users', () => {
      // User1 sends a message
      const user1Message = { ...mockMessage, senderUid: 'user1@example.com' }
      const messages = { 'test-room-1': [user1Message] }
      saveMessagesToStorage(messages)
      
      // Verify message was saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_MESSAGES_KEY,
        JSON.stringify(messages)
      )
      
      // User2 loads messages
      const storedData = JSON.stringify(messages)
      ;(localStorage.getItem as jest.Mock).mockReturnValue(storedData)
      
      const loadedMessages = getStoredMessages()
      
      // Verify User2 can see User1's message
      expect(loadedMessages['test-room-1']).toHaveLength(1)
      expect(loadedMessages['test-room-1'][0].senderUid).toBe('user1@example.com')
      expect(loadedMessages['test-room-1'][0].text).toBe('Test message')
    })

    test('should handle multiple users joining the same room', () => {
      // Initial room with User1
      const initialRoom = { ...mockRoom, participants: ['user1@example.com'] }
      
      // User2 joins the room
      const updatedRoom = {
        ...initialRoom,
        participants: ['user1@example.com', 'user2@example.com']
      }
      
      saveRoomsToStorage([updatedRoom])
      
      // Verify the updated room was saved
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify([updatedRoom])
      )
      
      // Load rooms to verify both users are in participants
      const storedData = JSON.stringify([updatedRoom])
      ;(localStorage.getItem as jest.Mock).mockReturnValue(storedData)
      
      const loadedRooms = getStoredRooms()
      
      expect(loadedRooms[0].participants).toContain('user1@example.com')
      expect(loadedRooms[0].participants).toContain('user2@example.com')
      expect(loadedRooms[0].participants).toHaveLength(2)
    })
  })

  describe('Error Handling', () => {
    test('should handle localStorage.setItem failures gracefully', () => {
      const mockError = new Error('Storage quota exceeded')
      ;(localStorage.setItem as jest.Mock).mockImplementation(() => {
        throw mockError
      })
      
      // Should not throw error
      expect(() => saveRoomsToStorage([mockRoom])).not.toThrow()
      expect(() => saveMessagesToStorage({})).not.toThrow()
    })

    test('should handle localStorage.getItem failures gracefully', () => {
      const mockError = new Error('Storage access denied')
      ;(localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw mockError
      })
      
      // Should return fallback values
      expect(getStoredRooms()).toEqual([])
      expect(getStoredMessages()).toEqual({})
    })
  })
})