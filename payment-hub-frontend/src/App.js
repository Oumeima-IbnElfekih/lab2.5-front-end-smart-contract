import React, { useState, useEffect } from 'react';
import { ethers, BrowserProvider } from 'ethers'; // Import BrowserProvider for ethers v6.x
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [balance, setBalance] = useState(0);
  const [depositAmount, setDepositAmount] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  // Connect Metamask
  const connectWallet = async () => {
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum); // Use BrowserProvider
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const userAddress = await signer.getAddress();
      setAccount(userAddress);

      // Replace "YOUR_CONTRACT_ADDRESS" with your deployed contract address
      const contractAddress = "0xEcBB3481bac91e26A6345779C4b5E7657C8a8B7a";
      const contractABI = [
        "function deposit() public payable",
        "function instantPayment(address recipient, uint256 amount) public",
        "function withdraw(uint256 amount) public",
        "function balances(address) public view returns (uint256)"
      ];

      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);

      const userBalance = await contract.balances(userAddress);
      setBalance(ethers.formatEther(userBalance));
    } else {
      alert('Please install Metamask!');
    }
  };

  // Deposit funds
  const depositFunds = async () => {
    if (contract && depositAmount > 0) {
      const tx = await contract.deposit({ value: ethers.parseEther(depositAmount) });
      await tx.wait();
      alert('Deposit successful');
    }
  };

  // Make an instant payment
  const makePayment = async () => {
    if (contract && paymentAmount > 0 && recipient) {
      const tx = await contract.instantPayment(recipient, ethers.parseEther(paymentAmount));
      await tx.wait();
      alert('Payment successful');
    }
  };

  // Withdraw funds
  const withdrawFunds = async () => {
    if (contract && balance > 0) {
      const tx = await contract.withdraw(ethers.parseEther(balance));
      await tx.wait();
      alert('Withdrawal successful');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      connectWallet();
    }
  }, []);

  return (
    <div className="App">
      <h1>Instant Payment Hub</h1>
      {account ? (
        <div>
          <p>Connected account: {account}</p>
          <p>Balance: {balance} ETH</p>

          <div>
            <h2>Deposit Funds</h2>
            <input
              type="number"
              placeholder="Amount to deposit"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
            />
            <button onClick={depositFunds}>Deposit</button>
          </div>

          <div>
            <h2>Make Payment</h2>
            <input
              type="text"
              placeholder="Recipient address"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
            />
            <input
              type="number"
              placeholder="Amount to pay"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
            />
            <button onClick={makePayment}>Pay</button>
          </div>

          <div>
            <h2>Withdraw Funds</h2>
            <button onClick={withdrawFunds}>Withdraw</button>
          </div>
        </div>
      ) : (
        <button onClick={connectWallet}>Connect Metamask</button>
      )}
    </div>
  );
}

export default App;
