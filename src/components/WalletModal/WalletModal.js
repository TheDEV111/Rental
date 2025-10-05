import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import './WalletModal.css';

const WalletModal = ({
  show,
  onHide,
  modalStep,
  connectMetaMask,
  installMetaMask,
  isMetaMaskInstalled,
  error,
  isConnecting,
  getFormattedAddress,
  balance,
  networkName,
}) => {

  const renderModalContent = () => {
    switch (modalStep) {
      case 'select':
        return (
          <div className="wallet-modal-content">
            <div className="modal-header-custom">
              <h4 className="modal-title">Connect Your Wallet</h4>
              <p className="modal-subtitle">Choose how you want to connect</p>
            </div>

            <div className="wallet-options">
              {isMetaMaskInstalled() ? (
                <div 
                  className="wallet-option metamask-option"
                  onClick={connectMetaMask}
                >
                  <div className="wallet-icon">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                      alt="MetaMask"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div className="wallet-info">
                    <h5>MetaMask</h5>
                    <p>Connect with MetaMask wallet</p>
                  </div>
                  <div className="wallet-arrow">→</div>
                </div>
              ) : (
                <div 
                  className="wallet-option install-option"
                  onClick={installMetaMask}
                >
                  <div className="wallet-icon">
                    <img 
                      src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                      alt="MetaMask"
                      width="40"
                      height="40"
                    />
                  </div>
                  <div className="wallet-info">
                    <h5>Install MetaMask</h5>
                    <p>Install MetaMask extension first</p>
                  </div>
                  <div className="wallet-arrow">⬇️</div>
                </div>
              )}

              <div className="wallet-option disabled-option">
                <div className="wallet-icon">
                  <div className="placeholder-icon">🔮</div>
                </div>
                <div className="wallet-info">
                  <h5>Other Wallets</h5>
                  <p>Coming soon...</p>
                </div>
                <div className="wallet-arrow">🚧</div>
              </div>
            </div>
          </div>
        );

      case 'connecting':
        return (
          <div className="wallet-modal-content connecting-state">
            <div className="connecting-animation">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
            <h4 className="mt-3">Connecting to MetaMask</h4>
            <p className="text-muted">
              Please approve the connection in your MetaMask extension
            </p>
            <div className="connecting-steps">
              <div className="step active">
                <span className="step-number">1</span>
                <span>Open MetaMask</span>
              </div>
              <div className="step active">
                <span className="step-number">2</span>
                <span>Approve Connection</span>
              </div>
              <div className="step">
                <span className="step-number">3</span>
                <span>Complete</span>
              </div>
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="wallet-modal-content success-state">
            <div className="success-animation">
              <div className="checkmark">✅</div>
            </div>
            <h4 className="mt-3 text-success">Successfully Connected!</h4>
            <div className="connection-info">
              <div className="info-item">
                <span className="label">Wallet:</span>
                <span className="value">{getFormattedAddress()}</span>
              </div>
              <div className="info-item">
                <span className="label">Balance:</span>
                <span className="value">{balance} ETH</span>
              </div>
              <div className="info-item">
                <span className="label">Network:</span>
                <span className="value">{networkName}</span>
              </div>
            </div>
            <p className="text-muted mt-3">
              This modal will close automatically...
            </p>
          </div>
        );

      case 'error':
        return (
          <div className="wallet-modal-content error-state">
            <div className="error-animation">
              <div className="error-icon">❌</div>
            </div>
            <h4 className="mt-3 text-danger">Connection Failed</h4>
            <p className="error-message">{error}</p>
            <div className="error-actions">
              <Button 
                variant="outline-primary" 
                onClick={() => window.location.reload()}
                className="me-2"
              >
                Refresh Page
              </Button>
              <Button 
                variant="primary" 
                onClick={() => modalStep === 'select' ? connectMetaMask() : null}
              >
                Try Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      className="wallet-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="border-0">
        <span></span>
      </Modal.Header>
      <Modal.Body>
        {renderModalContent()}
      </Modal.Body>
    </Modal>
  );
};

export default WalletModal;