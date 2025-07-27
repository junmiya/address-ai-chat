import { test, expect } from '@playwright/test';

test.describe('Simple Room Sharing Test', () => {
  test('Check if development server is running and basic functionality works', async ({ page }) => {
    // Basic connectivity test
    console.log('🔵 Testing server connectivity...');
    
    try {
      await page.goto('/login');
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      
      // Check if login page loads
      await expect(page).toHaveTitle(/Chat App/i);
      console.log('✅ Login page loads successfully');
      
      // Test login form presence
      const emailInput = page.locator('[data-testid="email"]');
      const passwordInput = page.locator('[data-testid="password"]');
      const loginButton = page.locator('[data-testid="login-button"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      await expect(loginButton).toBeVisible();
      console.log('✅ Login form elements are present');
      
      // Try login flow
      await emailInput.fill('test1@example.com');
      await passwordInput.fill('password123');
      await loginButton.click();
      
      // Wait for redirect
      await page.waitForURL('/dashboard', { timeout: 10000 });
      console.log('✅ Login successful, redirected to dashboard');
      
      // Navigate to chat
      await page.goto('/chat');
      await page.waitForLoadState('networkidle');
      
      // Check if room list is present
      const roomList = page.locator('[data-testid="room-list"]');
      await expect(roomList).toBeVisible({ timeout: 10000 });
      console.log('✅ Chat page loads with room list');
      
      // Check if create room button is present
      const createRoomButton = page.locator('[data-testid="create-room-button"]');
      await expect(createRoomButton).toBeVisible();
      console.log('✅ Create room button is visible');
      
      console.log('🎉 Basic functionality test passed!');
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      
      // Take screenshot for debugging
      await page.screenshot({ 
        path: `test-results/basic-test-failure-${Date.now()}.png`, 
        fullPage: true 
      });
      
      throw error;
    }
  });
});