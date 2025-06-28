
import React from 'react';
import { Item, Transaction } from '../types';

interface MiningPageProps {
  isLoggedIn: boolean;
  publicKeyFruits: [Item, Item, Item] | null;
  transactions: Transaction[];
  onLogout: () => void;
  // onNavigateToStoryPage: () => void; // Removed as StoryPage is not a portal anymore
  onNavigateToWalletPage: () => void;
}

const MiningPage: React.FC<MiningPageProps> = ({
  isLoggedIn,
  publicKeyFruits,
  transactions,
  onLogout,
  // onNavigateToStoryPage, // Removed
  onNavigateToWalletPage,
}) => {
  if (!isLoggedIn) {
    // This case should ideally not be hit if App.tsx redirects correctly,
    // but kept as a fallback.
    return (
      <div className="w-full max-w-xl mx-auto bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-red-400 mb-6">Redirecting to Login...</h2>
        <p className="text-white mb-6">You need to be logged in. Please wait.</p>
        {/* The onNavigateToStoryPage prop for a button is removed as App.tsx handles redirection */}
      </div>
    );
  }

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
            {/* "Story Portal" button removed */}
            <button 
                onClick={onNavigateToWalletPage}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg shadow-md text-xs sm:text-sm transition-transform transform hover:scale-105"
            >
                Wallet 🍌
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
        <h2 className="text-3xl font-bold text-center text-white mb-8">Transaction Log ⛏️</h2>
        {transactions.length === 0 ? (
          <p className="text-white text-center opacity-70 py-8">No transactions recorded yet.</p>
        ) : (
          <ul className="space-y-4">
            {transactions.slice().reverse().map(tx => (
              <li key={tx.id} className="bg-white/5 hover:bg-white/10 p-4 rounded-lg shadow-md transition-colors duration-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                    <p className="text-xl font-semibold text-yellow-400">{tx.amount} 🍌</p>
                    <p className="text-xs text-white/60 mt-1 sm:mt-0">{new Date(tx.timestamp).toLocaleString()}</p>
                </div>
                <div className="text-sm space-y-1">
                    <p className="text-white/90">
                        <span className="font-medium opacity-70">From: </span> 
                        <span className="text-lg">{tx.fromAddress.map(f => f.emoji).join('')}</span>
                        <span className="text-xs text-white/60 ml-1">({tx.fromAddress.map(f=>f.name).join(', ')})</span>
                    </p>
                    <p className="text-white/90">
                        <span className="font-medium opacity-70">To: </span> 
                        <span className="text-lg">{tx.toAddress.map(f => f.emoji).join('')}</span>
                        <span className="text-xs text-white/60 ml-1">({tx.toAddress.map(f=>f.name).join(', ')})</span>
                    </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MiningPage;
