import { type Page } from '@playwright/test';

export class FreighterMockService {
    readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async setupMock() {
    await this.page.addInitScript(`
      window.freighter = {
        isConnected: function() { 
          return Promise.resolve({ isConnected: true }); 
        },
        
        requestAccess: function() { 
          return Promise.resolve({}); // Nincs hiba, tehát üres objektum
        },
        
        getAddress: function() { 
          return Promise.resolve({ address: 'GDMOCKPUBLICKEY123456789' }); 
        },
        
        getNetwork: function() { 
          return Promise.resolve({ network: 'TESTNET', networkPassphrase: 'Test SDF Network ; September 2015' }); 
        }
      };
      console.log('--- FREIGHTER MOCK ACTIVATED ---');
    `);
  }
}