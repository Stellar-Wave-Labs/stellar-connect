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

  // Wait for the modal to be visible
  async selectFreighter() {

    await this.freighterButton.waitFor({ state: 'visible' });
    await this.freighterButton.click({ force: true });
  }

  // Wait for the modal to be visible
  async selectXBull() {
    await this.xBullButton.waitFor({ state: 'visible' });
    await this.xBullButton.click({ force: true }); 
  }
}