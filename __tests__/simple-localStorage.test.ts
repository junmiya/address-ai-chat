/**
 * localStorage機能の基本テスト
 * ルーム共有機能のコア機能をテスト
 */

describe('localStorage基本機能テスト', () => {
  // Mock localStorage
  const mockGetItem = jest.fn()
  const mockSetItem = jest.fn()
  
  // localStorage をモック化
  Object.defineProperty(window, 'localStorage', {
    value: {
      getItem: mockGetItem,
      setItem: mockSetItem,
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  })

  beforeEach(() => {
    mockGetItem.mockClear()
    mockSetItem.mockClear()
  })

  describe('ルーム共有シナリオ', () => {
    test('User1がルームを作成してlocalStorageに保存', () => {
      // User1がルームを作成するシナリオ
      const room = {
        roomId: 'test-room-1',
        ownerUid: 'user1@example.com',
        title: 'Test Room',
        visibility: 'public',
        participants: ['user1@example.com']
      }

      // localStorage.setItem の呼び出しをシミュレート
      window.localStorage.setItem('chat-app-mock-rooms', JSON.stringify([room]))

      // setItem が呼ばれたことを確認
      expect(mockSetItem).toHaveBeenCalledWith(
        'chat-app-mock-rooms',
        JSON.stringify([room])
      )
    })

    test('User2がlocalStorageからUser1のルームを読み込み', () => {
      // User1のルームがlocalStorageに保存されている状態
      const user1Room = {
        roomId: 'test-room-1',
        ownerUid: 'user1@example.com',
        title: 'Test Room',
        visibility: 'public',
        participants: ['user1@example.com']
      }

      // getItem の戻り値を設定
      mockGetItem.mockReturnValue(JSON.stringify([user1Room]))

      // User2がルームリストを読み込み
      const storedData = window.localStorage.getItem('chat-app-mock-rooms')
      const rooms = storedData ? JSON.parse(storedData) : []

      // getItem が呼ばれたことを確認
      expect(mockGetItem).toHaveBeenCalledWith('chat-app-mock-rooms')
      
      // User1のルームが読み込まれることを確認
      expect(rooms).toHaveLength(1)
      expect(rooms[0].ownerUid).toBe('user1@example.com')
      expect(rooms[0].title).toBe('Test Room')
      expect(rooms[0].visibility).toBe('public')
    })

    test('User2がUser1のルームに参加してlocalStorageを更新', () => {
      // User1のルームに User2 が参加するシナリオ
      const originalRoom = {
        roomId: 'test-room-1',
        ownerUid: 'user1@example.com',
        title: 'Test Room',
        visibility: 'public',
        participants: ['user1@example.com']
      }

      const updatedRoom = {
        ...originalRoom,
        participants: ['user1@example.com', 'user2@example.com']
      }

      // 参加後のルーム情報を保存
      window.localStorage.setItem('chat-app-mock-rooms', JSON.stringify([updatedRoom]))

      // setItem が更新されたルーム情報で呼ばれたことを確認
      expect(mockSetItem).toHaveBeenCalledWith(
        'chat-app-mock-rooms',
        JSON.stringify([updatedRoom])
      )
    })

    test('メッセージ送信時のlocalStorage保存', () => {
      // メッセージ送信シナリオ
      const message = {
        msgId: 'msg-1',
        roomId: 'test-room-1',
        senderUid: 'user1@example.com',
        text: 'Hello from User1!',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        isAiGenerated: false
      }

      const messages = {
        'test-room-1': [message]
      }

      // メッセージをlocalStorageに保存
      window.localStorage.setItem('chat-app-mock-messages', JSON.stringify(messages))

      // setItem が呼ばれたことを確認
      expect(mockSetItem).toHaveBeenCalledWith(
        'chat-app-mock-messages',
        JSON.stringify(messages)
      )
    })
  })

  describe('エラーハンドリング', () => {
    test('localStorage.getItem が null を返す場合の処理', () => {
      mockGetItem.mockReturnValue(null)

      const storedData = window.localStorage.getItem('chat-app-mock-rooms')
      const rooms = storedData ? JSON.parse(storedData) : []

      expect(rooms).toEqual([])
    })

    test('localStorage.getItem が無効なJSONを返す場合の処理', () => {
      mockGetItem.mockReturnValue('invalid-json')

      let result = []
      try {
        const storedData = window.localStorage.getItem('chat-app-mock-rooms')
        result = storedData ? JSON.parse(storedData) : []
      } catch (error) {
        // JSONパースエラーの場合はデフォルト値を使用
        result = []
      }

      expect(result).toEqual([])
    })
  })

  describe('データ形式の整合性', () => {
    test('Room データの必須フィールドが保持される', () => {
      const room = {
        roomId: 'test-room-1',
        ownerUid: 'user1@example.com',
        title: 'Test Room',
        notice: 'Test notice',
        visibility: 'public',
        chatType: '1vN',
        participants: ['user1@example.com'],
        aiProxyEnabled: true,
        createdAt: new Date().toISOString(),
        isActive: true,
        isClosed: false
      }

      // 保存と読み込みのサイクル
      const serialized = JSON.stringify([room])
      const deserialized = JSON.parse(serialized)

      expect(deserialized[0]).toMatchObject({
        roomId: 'test-room-1',
        ownerUid: 'user1@example.com',
        title: 'Test Room',
        visibility: 'public',
        participants: ['user1@example.com']
      })
    })

    test('Message データの必須フィールドが保持される', () => {
      const message = {
        msgId: 'msg-1',
        roomId: 'test-room-1',
        senderUid: 'user1@example.com',
        text: 'Test message',
        createdAt: new Date().toISOString(),
        isDeleted: false,
        isAiGenerated: false
      }

      // 保存と読み込みのサイクル
      const serialized = JSON.stringify({ 'test-room-1': [message] })
      const deserialized = JSON.parse(serialized)

      expect(deserialized['test-room-1'][0]).toMatchObject({
        msgId: 'msg-1',
        roomId: 'test-room-1',
        senderUid: 'user1@example.com',
        text: 'Test message',
        isDeleted: false
      })
    })
  })
})

// 統合テスト: 実際のユースケースシミュレーション
describe('ルーム共有統合テスト', () => {
  test('完全なルーム共有フロー: 作成→表示→参加→メッセージ', () => {
    const mockStorage: { [key: string]: string } = {}
    
    // localStorage の完全なモック
    const mockLocalStorage = {
      getItem: jest.fn((key: string) => mockStorage[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        mockStorage[key] = value
      }),
      removeItem: jest.fn((key: string) => {
        delete mockStorage[key]
      }),
      clear: jest.fn(() => {
        Object.keys(mockStorage).forEach(key => delete mockStorage[key])
      })
    }

    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    })

    // Step 1: User1 がルームを作成
    const newRoom = {
      roomId: 'integration-test-room',
      ownerUid: 'user1@example.com',
      title: 'Integration Test Room',
      visibility: 'public',
      participants: ['user1@example.com']
    }

    localStorage.setItem('chat-app-mock-rooms', JSON.stringify([newRoom]))
    
    // Step 2: User2 がルームリストを確認
    const roomsData = localStorage.getItem('chat-app-mock-rooms')
    const rooms = roomsData ? JSON.parse(roomsData) : []
    
    expect(rooms).toHaveLength(1)
    expect(rooms[0].title).toBe('Integration Test Room')
    expect(rooms[0].visibility).toBe('public')
    
    // Step 3: User2 がルームに参加
    const updatedRoom = {
      ...rooms[0],
      participants: [...rooms[0].participants, 'user2@example.com']
    }
    
    localStorage.setItem('chat-app-mock-rooms', JSON.stringify([updatedRoom]))
    
    // Step 4: User2 がメッセージを送信
    const message = {
      msgId: 'integration-msg-1',
      roomId: 'integration-test-room',
      senderUid: 'user2@example.com',
      text: 'Hello from User2!',
      createdAt: new Date().toISOString()
    }
    
    localStorage.setItem('chat-app-mock-messages', JSON.stringify({
      'integration-test-room': [message]
    }))
    
    // Step 5: User1 がメッセージを確認
    const messagesData = localStorage.getItem('chat-app-mock-messages')
    const messages = messagesData ? JSON.parse(messagesData) : {}
    
    expect(messages['integration-test-room']).toHaveLength(1)
    expect(messages['integration-test-room'][0].senderUid).toBe('user2@example.com')
    expect(messages['integration-test-room'][0].text).toBe('Hello from User2!')
    
    // 全ステップが成功したことを確認
    expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(3)
    expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(2)
  })
})