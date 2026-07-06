import { type Page } from '@playwright/test';

export class FreighterMockService {
    readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }
// setup the Freighter mock by injecting a script into the page context based on stellar kit's freighter mock implementation. This will override the global `window.freighter` object with a mock implementation that simulates the behavior of the Freighter wallet.

  async setupMock() {
    await this.page.addInitScript(`
      window.freighter = {
        isConnected: function() { 
          return Promise.resolve({ isConnected: true }); 
        },
        
        requestAccess: function() { 
          return Promise.resolve({});
        },
        
        getAddress: function() { 
          return Promise.resolve({ address: 'GDMOCKPUBLICKEY123456789' }); 
        },
        
        getNetwork: function() { 
          return Promise.resolve({ network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' }); 
        }
      };
      console.log('--- FREIGHTER MOCK IN USE ---');
    `);
  }
}