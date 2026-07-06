/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { LandingPage } from '../../pages/LandingPage';
import { ConnectWalletModal } from '../../pages/ConnectWalletModal';
import { FreighterMockService } from '../../services/FreighterMockService';

type StellarFixtures = {
    landingPage: LandingPage;
    connectWalletModal: ConnectWalletModal;
    freighterMockService: FreighterMockService;
};

// Extend the base test with our custom fixtures

export const test = base.extend<StellarFixtures>({
    
    landingPage: async ({ page }, use) => {
        const landingPage = new LandingPage(page);
        await use(landingPage);
    },
    
    connectWalletModal: async ({ page }, use) => {
        const connectWalletModal = new ConnectWalletModal(page);
        await use(connectWalletModal);
    },
    
    freighterMockService: async ({ page }, use) => {
        const freighterMockService = new FreighterMockService(page);
        await use(freighterMockService);
    }
});

export { expect } from '@playwright/test';