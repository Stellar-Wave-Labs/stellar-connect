import { test, expect } from '../e2e/fixtures/stellar.fixture';

test.describe('StellarConnect - Authentication Flow', () => {

  test.beforeEach(async ({ page }) => {
    page.on('pageerror', error => console.log('🔴 REACT ERROR:', error.message));
    page.on('console', msg => {
      if (msg.type() === 'error' || msg.type() === 'log') {
        console.log(`BROWSER ${msg.type().toUpperCase()}:`, msg.text());
      }
    });
  });

  test('should render the landing page and show the connect button', async ({ landingPage }) => {
    await landingPage.navigate();
    await expect(landingPage.isConnectButtonVisible()).resolves.toBe(true);
  });

  test('should successfully connect using mocked Freighter wallet', async ({ 
    page,
    freighterMockService, 
    landingPage 
  }) => {
    await freighterMockService.setupMock();
    await landingPage.navigate();
    
    const modal = await landingPage.clickConnectWallet();
    await expect(modal.freighterButton).toBeVisible();
    await modal.selectFreighter();
    
    const modalContainer = page.locator('section').filter({ hasText: 'Connect Wallet' });
    await expect(modalContainer).toBeHidden({ timeout: 5000 });
  });

  test('should open xBull fallback popup when wallet is not installed', async ({ 
    page, 
    landingPage 
  }) => {
    await landingPage.navigate();
    const modal = await landingPage.clickConnectWallet();
    
    const [popup] = await Promise.all([
      page.waitForEvent('popup'),
      modal.selectXBull()
    ]);

    await expect(popup).toHaveURL(/wallet\.xbull\.app\/connect\/no-wallet/);
    await expect(popup.getByText("Looks like you haven't used xBull Wallet before")).toBeVisible();
    
    await popup.close();
  });
});