import {type Page, type Locator} from '@playwright/test';
import { ConnectWalletModal } from './ConnectWalletModal';

export class LandingPage {
    readonly page: Page;
    readonly connectButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.connectButton = page.getByRole('button', { name: 'Connect Wallet' });
    }

    async navigate() {
    await this.page.goto('/');
  }

    async clickConnectWallet(): Promise<ConnectWalletModal> {
    await this.connectButton.click();
    return new ConnectWalletModal(this.page); 
  }

    async isConnectButtonVisible(): Promise<boolean> {
        return await this.connectButton.isVisible();
    }
}