import { useState, useEffect, useCallback } from 'react';
import Web3 from 'web3';

const useWallet = () => {
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [web3, setWeb3] = useState(null);
  const [chainId, setChainId] = useState('');
  const [networkName, setNetworkName] = useState('');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalStep, setModalStep] = useState('select'); // 'select', 'connecting', 'success', 'error'

  // Network mapping - useCallback to stabilize for other useCallbacks
  const getNetworkName = useCallback((chainId) => {
    const networks = {
      '0x1': 'Ethereum Mainnet',
      '0x5': 'Goerli Testnet',
      '0x11155111': 'Sepolia Testnet',
      '0x89': 'Polygon Mainnet',
      '0x13881': 'Polygon Mumbai Testnet',
      '0xa86a': 'Avalanche Mainnet',
      '0xa869': 'Avalanche Fuji Testnet',
    };
    return networks[chainId] || `Unknown Network (${chainId})`;
  }, []);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && 
           typeof window.ethereum !== 'undefined' && 
           window.ethereum.isMetaMask;
  };

  // Update account info - useCallback to prevent unnecessary re-renders
  const updateAccountInfo = useCallback(async (web3Instance, accountAddress) => {
    try {
      if (!web3Instance || !accountAddress) {
        setAccount('');
        setBalance('');
        setIsConnected(false);
        return;
      }

      setAccount(accountAddress);
      setIsConnected(true);

      // Get balance
      const balanceWei = await web3Instance.eth.getBalance(accountAddress);
      const balanceEth = web3Instance.utils.fromWei(balanceWei, 'ether');
      setBalance(parseFloat(balanceEth).toFixed(4));

      // Get chain ID and network name
      const currentChainId = await web3Instance.eth.getChainId();
      const hexChainId = '0x' + currentChainId.toString(16);
      setChainId(hexChainId);
      setNetworkName(getNetworkName(hexChainId));

      console.log('✅ Connected to MetaMask:', {
        account: accountAddress,
        balance: balanceEth + ' ETH',
        network: getNetworkName(hexChainId)
      });
    } catch (err) {
      console.error('Error updating account info:', err);
    }
  }, [getNetworkName]);

  // Initialize web3 and check existing connection - ONLY RUN ONCE
  useEffect(() => {
    const initializeWeb3 = async () => {
      if (!isMetaMaskInstalled()) return;

      try {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        // Check if already connected (without prompting)
        const accounts = await window.ethereum.request({
          method: 'eth_accounts'
        });

        if (accounts && accounts.length > 0) {
          // Auto-reconnect if user previously connected
          await updateAccountInfo(web3Instance, accounts[0]);
        }
      } catch (err) {
        console.error('Error initializing Web3:', err);
      }
    };

    initializeWeb3();
  }, []); // Empty dependency array - only run once

  // Set up event listeners
  useEffect(() => {
    if (!isMetaMaskInstalled()) return;

    const handleAccountsChanged = async (accounts) => {
      console.log('🔄 MetaMask accounts changed:', accounts);
      if (accounts.length === 0) {
        // User disconnected
        setAccount('');
        setBalance('');
        setIsConnected(false);
        setError('');
      } else {
        // Account switched - update info
        if (web3) {
          await updateAccountInfo(web3, accounts[0]);
        }
      }
    };

    const handleChainChanged = (chainId) => {
      console.log('🔗 Network changed to:', chainId);
      setChainId(chainId);
      setNetworkName(getNetworkName(chainId));
      // Reload to avoid state issues
      window.location.reload();
    };

    const handleConnect = async (connectInfo) => {
      console.log('🔗 MetaMask connected:', connectInfo);
      if (web3) {
        const accounts = await web3.eth.getAccounts();
        if (accounts.length > 0) {
          await updateAccountInfo(web3, accounts[0]);
        }
      }
    };

    const handleDisconnect = (error) => {
      console.log('❌ MetaMask disconnected:', error);
      setAccount('');
      setBalance('');
      setIsConnected(false);
      setError('');
    };

    // Add event listeners
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('connect', handleConnect);
    window.ethereum.on('disconnect', handleDisconnect);

    // Cleanup event listeners
    return () => {
      if (window.ethereum && window.ethereum.removeListener) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('connect', handleConnect);
        window.ethereum.removeListener('disconnect', handleDisconnect);
      }
    };
  }, [web3]); // Only depend on web3

  // Open wallet connection modal
  const openWalletModal = () => {
    setShowModal(true);
    setModalStep('select');
    setError('');
  };

  // Close wallet connection modal
  const closeWalletModal = () => {
    setShowModal(false);
    setModalStep('select');
    setError('');
    setIsConnecting(false);
  };

  // Connect to MetaMask wallet
  const connectMetaMask = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed. Please install MetaMask extension.');
      setModalStep('error');
      return;
    }

    setIsConnecting(true);
    setModalStep('connecting');
    setError('');

    try {
      console.log('🦊 Requesting MetaMask connection...');
      
      // This will open MetaMask popup for user approval
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts && accounts.length > 0) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);
        await updateAccountInfo(web3Instance, accounts[0]);
        console.log('🎉 Successfully connected to MetaMask!');
        setModalStep('success');
        
        // Auto-close modal after success
        setTimeout(() => {
          closeWalletModal();
        }, 2000);
      } else {
        setError('No accounts found. Please check your MetaMask wallet.');
        setModalStep('error');
      }
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setModalStep('error');
      
      if (err.code === 4001) {
        setError('Connection rejected. Please approve the connection in MetaMask.');
      } else if (err.code === -32002) {
        setError('MetaMask is already processing a request. Please wait.');
      } else {
        setError('Failed to connect to MetaMask. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('');
    setBalance('');
    setIsConnected(false);
    setError('');
    setWeb3(null);
    setChainId('');
    setNetworkName('');
    console.log('👋 Disconnected from MetaMask');
  };

  // Format address for display
  const getFormattedAddress = () => {
    if (!account) return '';
    return `${account.slice(0, 6)}...${account.slice(-4)}`;
  };

  // Open MetaMask installation page
  const installMetaMask = () => {
    window.open('https://metamask.io/download/', '_blank');
  };

  return {
    account,
    balance,
    isConnected,
    isConnecting,
    error,
    chainId,
    networkName,
    web3,
    
    // Modal functions
    showModal,
    modalStep,
    openWalletModal,
    closeWalletModal,
    connectMetaMask,
    
    // Utility functions
    disconnectWallet,
    getFormattedAddress,
    isMetaMaskInstalled,
    installMetaMask,
  };
};

export default useWallet;