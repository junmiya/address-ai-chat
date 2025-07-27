import { test, expect } from '@playwright/test';

test.describe('Room Sharing Between Users', () => {
  test('Public room created by user1 should be visible to user2', async ({ browser }) => {
    // Create two separate browser contexts to simulate different users
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // User 1: Login and create a public room
      console.log('🔵 User1: Starting login process...');
      await page1.goto('/login');
      await page1.waitForLoadState('networkidle');
      
      // Login as test1@example.com
      await page1.fill('[data-testid="email"]', 'test1@example.com');
      await page1.fill('[data-testid="password"]', 'password123');
      await page1.click('[data-testid="login-button"]');
      
      // Wait for login to complete and navigate to chat
      await page1.waitForURL('/dashboard');
      await page1.goto('/chat');
      await page1.waitForLoadState('networkidle');
      
      console.log('🔵 User1: Creating public room...');
      
      // Create a new public room
      await page1.click('[data-testid="create-room-button"]');
      await page1.waitForSelector('[data-testid="room-form"]');
      
      const roomTitle = `Test Public Room ${Date.now()}`;
      await page1.fill('[data-testid="room-title"]', roomTitle);
      await page1.fill('[data-testid="room-notice"]', 'This is a test public room for E2E testing');
      await page1.selectOption('[data-testid="room-visibility"]', 'public');
      await page1.selectOption('[data-testid="room-chat-type"]', '1vN');
      await page1.click('[data-testid="create-room-submit"]');
      
      // Wait for room creation to complete
      await page1.waitForSelector('[data-testid="chat-room"]', { timeout: 10000 });
      
      console.log('🔵 User1: Room created successfully:', roomTitle);

      // User 2: Login and check if the room is visible
      console.log('🟢 User2: Starting login process...');
      await page2.goto('/login');
      await page2.waitForLoadState('networkidle');
      
      // Login as test2@example.com
      await page2.fill('[data-testid="email"]', 'test2@example.com');
      await page2.fill('[data-testid="password"]', 'password123');
      await page2.click('[data-testid="login-button"]');
      
      // Wait for login to complete and navigate to chat
      await page2.waitForURL('/dashboard');
      await page2.goto('/chat');
      await page2.waitForLoadState('networkidle');
      
      console.log('🟢 User2: Checking for public rooms...');
      
      // Wait for room list to load
      await page2.waitForSelector('[data-testid="room-list"]', { timeout: 10000 });
      
      // Check if the public room section exists
      const publicRoomsSection = page2.locator('[data-testid="public-rooms-section"]');
      await expect(publicRoomsSection).toBeVisible({ timeout: 10000 });
      
      // Check if the created room is visible in the public rooms section
      const createdRoomInList = page2.locator(`[data-testid="public-room-${roomTitle}"]`);
      await expect(createdRoomInList).toBeVisible({ timeout: 10000 });
      
      console.log('🟢 User2: Public room found in list!');
      
      // Test joining the public room
      console.log('🟢 User2: Attempting to join public room...');
      await page2.click(`[data-testid="join-room-${roomTitle}"]`);
      
      // Wait for room list to refresh and check if room moved to "joined rooms"
      await page2.waitForSelector('[data-testid="joined-rooms-section"]', { timeout: 10000 });
      const joinedRoomsSection = page2.locator('[data-testid="joined-rooms-section"]');
      await expect(joinedRoomsSection).toBeVisible();
      
      // Check if the room is now in the joined rooms section
      const joinedRoom = page2.locator(`[data-testid="joined-room-${roomTitle}"]`);
      await expect(joinedRoom).toBeVisible({ timeout: 10000 });
      
      console.log('🟢 User2: Successfully joined the public room!');
      
      // Test clicking on the joined room to enter chat
      await page2.click(`[data-testid="joined-room-${roomTitle}"]`);
      await page2.waitForSelector('[data-testid="chat-room"]', { timeout: 10000 });
      
      // Verify we're in the correct room
      const roomHeader = page2.locator('[data-testid="room-title"]');
      await expect(roomHeader).toContainText(roomTitle);
      
      console.log('🟢 User2: Successfully entered the chat room!');
      
      // Test sending a message from user2
      console.log('🟢 User2: Sending test message...');
      await page2.fill('[data-testid="message-input"]', 'Hello from User2! E2E test message.');
      await page2.click('[data-testid="send-message-button"]');
      
      // Wait for message to appear
      await page2.waitForSelector('[data-testid="message-list"]', { timeout: 5000 });
      const messageList = page2.locator('[data-testid="message-list"]');
      await expect(messageList).toContainText('Hello from User2! E2E test message.');
      
      console.log('🟢 User2: Message sent successfully!');
      
      // Switch back to user1 and verify they can see user2's message
      console.log('🔵 User1: Checking for user2 message...');
      await page1.reload();
      await page1.waitForSelector('[data-testid="message-list"]', { timeout: 10000 });
      const user1MessageList = page1.locator('[data-testid="message-list"]');
      await expect(user1MessageList).toContainText('Hello from User2! E2E test message.', { timeout: 10000 });
      
      console.log('🔵 User1: Successfully received user2 message!');
      
      console.log('✅ Room sharing test completed successfully!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      
      // Take screenshots for debugging
      await page1.screenshot({ path: `test-results/user1-failure-${Date.now()}.png`, fullPage: true });
      await page2.screenshot({ path: `test-results/user2-failure-${Date.now()}.png`, fullPage: true });
      
      throw error;
    } finally {
      await context1.close();
      await context2.close();
    }
  });

  test('Private room created by user1 should NOT be visible to user2', async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    try {
      // User 1: Create a private room
      await page1.goto('/login');
      await page1.fill('[data-testid="email"]', 'test1@example.com');
      await page1.fill('[data-testid="password"]', 'password123');
      await page1.click('[data-testid="login-button"]');
      await page1.waitForURL('/dashboard');
      await page1.goto('/chat');
      
      await page1.click('[data-testid="create-room-button"]');
      const privateRoomTitle = `Private Room ${Date.now()}`;
      await page1.fill('[data-testid="room-title"]', privateRoomTitle);
      await page1.selectOption('[data-testid="room-visibility"]', 'private');
      await page1.click('[data-testid="create-room-submit"]');
      await page1.waitForSelector('[data-testid="chat-room"]');
      
      // User 2: Check that private room is NOT visible
      await page2.goto('/login');
      await page2.fill('[data-testid="email"]', 'test2@example.com');
      await page2.fill('[data-testid="password"]', 'password123');
      await page2.click('[data-testid="login-button"]');
      await page2.waitForURL('/dashboard');
      await page2.goto('/chat');
      await page2.waitForSelector('[data-testid="room-list"]');
      
      // Verify private room is NOT in public rooms section
      const privateRoomInList = page2.locator(`[data-testid="public-room-${privateRoomTitle}"]`);
      await expect(privateRoomInList).not.toBeVisible();
      
      console.log('✅ Private room correctly hidden from other users!');
      
    } finally {
      await context1.close();
      await context2.close();
    }
  });
});