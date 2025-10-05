import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import logo from "../../images/logo/logo.png";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./navbar.css";
import useWallet from "../../hooks/useWallet";
import WalletModal from "../WalletModal/WalletModal";

function NavBar() {
  const {
    balance,
    isConnected,
    isConnecting,
    error,
    networkName,
    
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
  } = useWallet();

  return (
    <Navbar expand="lg" className="py-3">
      <Container>
        <Navbar.Brand href="#" className="me-lg-5">
          <img className="logo" src={logo} alt="logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav className="me-auto my-2 my-lg-0" navbarScroll>
            <Nav.Link href="#action1">Marketplace</Nav.Link>
            <Nav.Link href="#action2" className="px-lg-3">
              About Us
            </Nav.Link>
            <Nav.Link href="#action3">Developers</Nav.Link>
          </Nav>
        </Navbar.Collapse>
        <div className="d-flex align-items-center order">
          <span className="line d-lg-inline-block d-none"></span>
          <i className="fa-regular fa-heart"></i>
          
          {/* Error Display */}
          {error && (
            <div className="alert alert-danger me-3 mb-0 py-2 px-3" style={{fontSize: '12px'}}>
              {error}
            </div>
          )}
          
          {/* Wallet Connection Logic */}
          {!isConnected ? (
            <Button
              variant="primary"
              className="btn-primary"
              onClick={openWalletModal}
              disabled={isConnecting}
            >
              Connect Wallet
            </Button>
          ) : (
            <div className="wallet-info d-flex align-items-center">
              <div className="wallet-details me-3 text-end">
                <div className="wallet-address text-white" style={{fontSize: '14px', fontWeight: '500'}}>
                  {getFormattedAddress()}
                </div>
                <div className="wallet-balance text-muted" style={{fontSize: '12px'}}>
                  {balance} ETH
                </div>
                <div className="wallet-network text-muted" style={{fontSize: '11px'}}>
                  {networkName}
                </div>
              </div>
              <Button
                variant="outline-light"
                size="sm"
                onClick={disconnectWallet}
                className="disconnect-btn"
              >
                Disconnect
              </Button>
            </div>
          )}
        </div>
      </Container>

      {/* Wallet Connection Modal */}
      <WalletModal
        show={showModal}
        onHide={closeWalletModal}
        modalStep={modalStep}
        connectMetaMask={connectMetaMask}
        installMetaMask={installMetaMask}
        isMetaMaskInstalled={isMetaMaskInstalled}
        error={error}
        isConnecting={isConnecting}
        getFormattedAddress={getFormattedAddress}
        balance={balance}
        networkName={networkName}
      />
    </Navbar>
  );
}

export default NavBar;
