import {type Page, type Locator } from '@playwright/test';

export class ConnectWalletModal {
  readonly page: Page;
  readonly freighterButton: Locator;
  readonly xBullButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.freighterButton = page.locator('li').filter({ hasText: 'Freighter' });
    this.xBullButton = page.locator('li').filter({ hasText: 'xBull' });
  }

  async selectFreighter() {
    const target = this.freighterButton.locator('p');
    
    await target.waitFor({ state: 'visible' });
    await this.page.waitForTimeout(1000);
    await target.click({ force: true });
  }

  async selectXBull() {
    await this.xBullButton.waitFor({ state: 'visible' });
    await this.xBullButton.click({ force: true }); 
  }
}