
import React from 'react';
import { Item } from '../types';

interface SelectionGridProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  gridTitle: string;
  disabled?: boolean;
}

const SelectionGrid: React.FC<SelectionGridProps> = ({ items, onSelectItem, gridTitle, disabled = false }) => {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-xl shadow-2xl">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-white mb-6 sm:mb-8">{gridTitle}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item)}
            disabled={disabled}
            className={`
              bg-white/20 text-white p-3 sm:p-4 rounded-lg shadow-md 
              flex flex-col items-center justify-center aspect-square
              transition-all duration-300 ease-in-out 
              ${disabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white/30 hover:shadow-xl transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75'}
            `}
          >
            <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">{item.emoji}</div>
            <div className="text-xs sm:text-sm font-semibold text-center">{item.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SelectionGrid;
