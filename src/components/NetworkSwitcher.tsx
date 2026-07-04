import React, { useState } from 'react';
import { Button, Modal } from '@geist-ui/core';
import { Network, ChevronDown } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

const NetworkSwitcher: React.FC = () => {
  const { activeChain, switchChain } = useWallet();
  const [visible, setVisible] = useState(false);

  const handleSwitch = (chain: 'evm' | 'stellar') => {
    switchChain(chain);
    setVisible(false);
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50">
        <Button
          auto
          scale={0.85}
          icon={<Network size={16} />}
          iconRight={<ChevronDown size={14} />}
          onClick={() => setVisible(true)}
          className="capitalize font-semibold shadow-md"
        >
          {activeChain === 'evm' ? 'Base (EVM)' : 'Stellar'}
        </Button>
      </div>

      <Modal visible={visible} onClose={() => setVisible(false)}>
        <Modal.Title>Switch Network</Modal.Title>
        <Modal.Subtitle>Choose the active blockchain engine</Modal.Subtitle>
        <Modal.Content>
          <div className="flex flex-col gap-3">
            <Button
              className="w-full justify-start text-left font-semibold"
              onClick={() => handleSwitch('evm')}
              type={activeChain === 'evm' ? 'secondary' : 'default'}
              ghost={activeChain === 'evm'}
            >
              Base (EVM)
              {activeChain === 'evm' && ' ✓'}
            </Button>
            <Button
              className="w-full justify-start text-left font-semibold"
              onClick={() => handleSwitch('stellar')}
              type={activeChain === 'stellar' ? 'secondary' : 'default'}
              ghost={activeChain === 'stellar'}
            >
              Stellar
              {activeChain === 'stellar' && ' ✓'}
            </Button>
          </div>
        </Modal.Content>
      </Modal>
    </>
  );
};

export default NetworkSwitcher;
