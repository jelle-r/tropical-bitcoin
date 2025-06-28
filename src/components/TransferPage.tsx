
import React, { useState, useCallback, useEffect } from 'react';
import { Item } from '../types'; 
import { FRUITS } from '../constants';
// SelectionGrid is no longer used here directly for fruit picking
// import SelectionGrid from './SelectionGrid'; 

interface TransferPageProps {
  isLoggedIn: boolean;
  publicKeyFruits: [Item, Item, Item] | null;
  onLogout: () => void;
  onNavigateToMiningPage: () => void; 
  onAddTransaction: (toAddress: [Item, Item, Item], amount: number) => void;
}

const BANANA_BALANCE = 1; 

const TransferPage: React.FC<TransferPageProps> = ({ 
  isLoggedIn, 
  publicKeyFruits, 
  onLogout, 
  onNavigateToMiningPage,
  onAddTransaction
}) => {
  const [selectedFruit1Id, setSelectedFruit1Id] = useState<string>('');
  const [selectedFruit2Id, setSelectedFruit2Id] = useState<string>('');
  const [selectedFruit3Id, setSelectedFruit3Id] = useState<string>('');
  
  const [amount, setAmount] = useState<string>('');
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [resolvedToAddress, setResolvedToAddress] = useState<[Item, Item, Item] | null>(null);

  useEffect(() => {
    if (selectedFruit1Id && selectedFruit2Id && selectedFruit3Id) {
      const fruit1 = FRUITS.find(f => f.id === selectedFruit1Id);
      const fruit2 = FRUITS.find(f => f.id === selectedFruit2Id);
      const fruit3 = FRUITS.find(f => f.id === selectedFruit3Id);
      if (fruit1 && fruit2 && fruit3) {
        setResolvedToAddress([fruit1, fruit2, fruit3]);
      } else {
        setResolvedToAddress(null);
      }
    } else {
      setResolvedToAddress(null);
    }
  }, [selectedFruit1Id, selectedFruit2Id, selectedFruit3Id]);

  const handleSend = useCallback(() => {
    setMessage(null);
    setMessageType(null);

    if (!resolvedToAddress) {
      setMessage('Please select three fruits for the destination address.');
      setMessageType('error');
      return;
    }
    
    const [fruit1, fruit2, fruit3] = resolvedToAddress;

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setMessage('Please enter a valid amount greater than zero.');
      setMessageType('error');
      return;
    }

    if (numericAmount > BANANA_BALANCE) {
      setMessage(`Amount exceeds your balance of ${BANANA_BALANCE} 🍌.`);
      setMessageType('error');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
      onAddTransaction([fruit1, fruit2, fruit3], numericAmount); 

      const addressDisplay = `${fruit1.emoji}${fruit2.emoji}${fruit3.emoji}`;
      setMessage(`Successfully sent ${numericAmount} 🍌 to ${addressDisplay}!`);
      setMessageType('success');
      
      // Reset form for next transaction
      setSelectedFruit1Id('');
      setSelectedFruit2Id('');
      setSelectedFruit3Id('');
      setResolvedToAddress(null);
      setAmount('');
      setIsLoading(false);
    }, 1000);

  }, [amount, resolvedToAddress, onAddTransaction]);


  if (!isLoggedIn) {
    return (
      <div className="w-full max-w-xl mx-auto bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-6">Redirecting to Login...</h2>
        <p className="text-white mb-6">You need to be logged in. Please wait.</p>
      </div>
    );
  }
  
  const selectClasses = "w-full p-3 bg-white/20 text-white rounded-lg border-2 border-transparent focus:border-yellow-400 focus:ring-yellow-400 focus:outline-none transition-colors text-center text-lg appearance-none";


  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-xl shadow-2xl mb-6 flex flex-col sm:flex-row justify-between items-center">
        <div>
            <p className="text-xs text-white/80">Logged in as:</p>
            {publicKeyFruits && (
                <p 
                    className="text-lg sm:text-xl font-semibold text-yellow-300 tracking-wider"
                    aria-label={`Logged in as: ${publicKeyFruits.map(f => f.name).join(' ')}`}
                >
                    {publicKeyFruits.map(f => f.emoji).join('')}
                </p>
            )}
        </div>
        <div className="flex flex-wrap gap-2 mt-3 sm:mt-0">
            <button 
                onClick={onNavigateToMiningPage}
                className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg shadow-md text-xs sm:text-sm transition-transform transform hover:scale-105"
            >
                Mining Page ⛏️
            </button>
            <button
              onClick={onLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-md text-xs sm:text-sm transition-transform transform hover:scale-105"
              aria-label="Logout"
            >
              Logout
            </button>
        </div>
      </div>

      <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Banana Wallet 🍌</h2>
        
        <div className="text-center mb-8">
          <p className="text-xl text-white">Your Balance:</p>
          <p className="text-4xl font-bold text-yellow-400">{BANANA_BALANCE} 🍌</p>
        </div>

        <h3 className="text-xl font-semibold text-white mb-2 text-center">Transfer To Address:</h3>
        <p className="text-xs text-white/70 text-center mb-4">Select three fruits to form the destination address.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="fruit1-select" className="sr-only">Fruit 1</label>
            <select 
              id="fruit1-select" 
              value={selectedFruit1Id} 
              onChange={(e) => setSelectedFruit1Id(e.target.value)}
              className={selectClasses}
            >
              <option value="" disabled>-- Fruit 1 --</option>
              {FRUITS.map(fruit => (
                <option key={fruit.id} value={fruit.id}>{fruit.emoji} {fruit.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fruit2-select" className="sr-only">Fruit 2</label>
            <select 
              id="fruit2-select" 
              value={selectedFruit2Id} 
              onChange={(e) => setSelectedFruit2Id(e.target.value)}
              className={selectClasses}
            >
              <option value="" disabled>-- Fruit 2 --</option>
              {FRUITS.map(fruit => (
                <option key={fruit.id} value={fruit.id}>{fruit.emoji} {fruit.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="fruit3-select" className="sr-only">Fruit 3</label>
            <select 
              id="fruit3-select" 
              value={selectedFruit3Id} 
              onChange={(e) => setSelectedFruit3Id(e.target.value)}
              className={selectClasses}
            >
              <option value="" disabled>-- Fruit 3 --</option>
              {FRUITS.map(fruit => (
                <option key={fruit.id} value={fruit.id}>{fruit.emoji} {fruit.name}</option>
              ))}
            </select>
          </div>
        </div>
        
        {resolvedToAddress && (
            <div className="text-center my-4 p-3 bg-black/20 rounded-lg">
                <p className="text-white text-sm">Selected Address:</p>
                <p className="text-3xl font-mono tracking-widest">{resolvedToAddress.map(f => f.emoji).join('')}</p>
            </div>
        )}

        <div className="mb-6">
          <label htmlFor="amount" className="block text-lg font-medium text-white mb-2 text-center">Amount to Send:</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => {
                setMessage(null); // Clear message on amount change
                setAmount(e.target.value);
            }}
            placeholder="e.g., 0.5"
            min="0.01"
            step="0.01"
            max={BANANA_BALANCE.toString()}
            className="w-full p-3 bg-white/20 text-white rounded-lg border-2 border-transparent focus:border-yellow-400 focus:ring-yellow-400 focus:outline-none transition-colors text-center text-xl"
          />
        </div>

        {message && (
          <div className={`p-3 mb-6 rounded-lg text-center text-md ${
            messageType === 'success' ? 'bg-green-500/80 text-white' : 
            messageType === 'error' ? 'bg-red-500/80 text-white' : ''
          }`}>
            {message}
          </div>
        )}

        <div className="text-center">
          <button
            onClick={handleSend}
            disabled={!resolvedToAddress || !amount || parseFloat(amount) <= 0 || isLoading || !publicKeyFruits}
            className={`bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl 
                        transition-all duration-300 transform hover:scale-105 
                        focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-75
                        ${(!resolvedToAddress || !amount || parseFloat(amount) <= 0 || isLoading || !publicKeyFruits) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mx-auto"></div>
            ) : (
                'Send Bananas'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferPage;
