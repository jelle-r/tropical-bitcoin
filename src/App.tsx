
import React, { useState, useCallback, useEffect } from 'react';
import { StoryStage, Item, Page, Transaction } from './types'; 
import { ANIMALS, PLACES, OBJECTS, FRUITS } from './constants';
import SelectionGrid from './components/SelectionGrid';
import TransferPage from './components/TransferPage';
import MiningPage from './components/MiningPage';

// --- Cookie Helper Functions ---
function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function deleteCookie(name: string) {
  document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
}
// --- End Cookie Helper Functions ---

interface SessionData {
  selectedAnimalId: string;
  selectedPlaceId: string;
  selectedObjectId: string;
  privateKey: string;
  publicKeyFruitIds: [string, string, string];
}

const App: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<StoryStage>(StoryStage.SelectingAnimal);
  const [selectedAnimal, setSelectedAnimal] = useState<Item | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<Item | null>(null);
  const [selectedObject, setSelectedObject] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(true);
  const [privateKey, setPrivateKey] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<[Item, Item, Item] | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.StoryPage);
  
  // Initialize transactions from localStorage
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('bananaTransactions');
    if (savedTransactions) {
      try {
        return JSON.parse(savedTransactions);
      } catch (error) {
        console.error("Failed to parse transactions from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const navigateTo = (page: Page) => {
    setCurrentPage(page);
  };

  // Effect for initial session loading from cookie
  useEffect(() => {
    setIsInitializing(true);
    const savedSession = getCookie('storySession');
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession) as SessionData;
        const animal = ANIMALS.find(a => a.id === sessionData.selectedAnimalId);
        const place = PLACES.find(p => p.id === sessionData.selectedPlaceId);
        const object = OBJECTS.find(o => o.id === sessionData.selectedObjectId);

        let reconstructedPkFruits: [Item, Item, Item] | null = null;
        if (sessionData.publicKeyFruitIds && sessionData.publicKeyFruitIds.length === 3) {
            const fruit1 = FRUITS.find(f => f.id === sessionData.publicKeyFruitIds[0]);
            const fruit2 = FRUITS.find(f => f.id === sessionData.publicKeyFruitIds[1]);
            const fruit3 = FRUITS.find(f => f.id === sessionData.publicKeyFruitIds[2]);
            if (fruit1 && fruit2 && fruit3) {
                reconstructedPkFruits = [fruit1, fruit2, fruit3];
            }
        }

        if (animal && place && object && sessionData.privateKey && reconstructedPkFruits) {
          setSelectedAnimal(animal);
          setSelectedPlace(place);
          setSelectedObject(object);
          setPrivateKey(sessionData.privateKey);
          setPublicKey(reconstructedPkFruits);
          setIsLoggedIn(true);
          setCurrentStage(StoryStage.StoryComplete);
          navigateTo(Page.TransferPage); // Redirect to wallet page on session restore
        } else {
          console.warn("Session data incomplete or public key fruits couldn't be reconstructed.", sessionData);
          deleteCookie('storySession');
        }
      } catch (error) {
        console.error("Failed to parse session cookie:", error);
        deleteCookie('storySession');
      }
    }
    setIsInitializing(false);
  }, []);


  const handleAnimalSelect = useCallback((animal: Item) => {
    setIsLoading(true);
    setSelectedAnimal(animal);
    setTimeout(() => {
      setCurrentStage(StoryStage.SelectingPlace);
      setIsLoading(false);
    }, 300);
  }, []);

  const handlePlaceSelect = useCallback((place: Item) => {
    setIsLoading(true);
    setSelectedPlace(place);
    setTimeout(() => {
      setCurrentStage(StoryStage.SelectingObject);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleObjectSelect = useCallback((object: Item) => {
    setIsLoading(true);
    setSelectedObject(object);
    setTimeout(() => {
      setCurrentStage(StoryStage.StoryComplete);
      setIsLoading(false);
    }, 300);
  }, []);

  const handleReset = useCallback(() => {
    setSelectedAnimal(null);
    setSelectedPlace(null);
    setSelectedObject(null);
    setPrivateKey(null);
    setPublicKey(null);
    setCurrentStage(StoryStage.SelectingAnimal);
    // Transactions are NOT cleared on reset/logout anymore
  }, []);

  const handleStoryConfirmAndLogin = useCallback(() => {
    if (!selectedAnimal || !selectedPlace || !selectedObject || !privateKey || !publicKey) return;
    
    setIsLoading(true);
    const sessionData: SessionData = {
      selectedAnimalId: selectedAnimal.id,
      selectedPlaceId: selectedPlace.id,
      selectedObjectId: selectedObject.id,
      privateKey: privateKey,
      publicKeyFruitIds: publicKey.map(fruit => fruit.id) as [string, string, string],
    };
    setCookie('storySession', JSON.stringify(sessionData), 7);

    setTimeout(() => {
      setIsLoggedIn(true);
      navigateTo(Page.TransferPage); // Redirect to wallet page after login
      setIsLoading(false);
    }, 500);
  }, [selectedAnimal, selectedPlace, selectedObject, privateKey, publicKey]);

  const handleLogout = useCallback(() => {
    setIsLoading(true);
    deleteCookie('storySession');
    setTimeout(() => {
      handleReset();
      setIsLoggedIn(false);
      navigateTo(Page.StoryPage); 
      setIsLoading(false);
    }, 500);
  }, [handleReset]);

  useEffect(() => {
    if (currentStage === StoryStage.StoryComplete && selectedAnimal && selectedPlace && selectedObject && !isLoggedIn && !privateKey && !publicKey) {
      const animalIndex = ANIMALS.findIndex(a => a.id === selectedAnimal.id);
      const placeIndex = PLACES.findIndex(p => p.id === selectedPlace.id);
      const objectIndex = OBJECTS.findIndex(o => o.id === selectedObject.id);

      if (animalIndex !== -1 && placeIndex !== -1 && objectIndex !== -1) {
        const calculatedPrivateKeyNum = animalIndex * (16 * 16) + placeIndex * 16 + objectIndex;
        setPrivateKey(calculatedPrivateKeyNum.toString());

        const pkNum = calculatedPrivateKeyNum;
        const fruitIndex1 = pkNum % 16; 
        const fruitIndex2 = Math.floor(pkNum / 16) % 16;
        const fruitIndex3 = Math.floor(pkNum / (16 * 16)) % 16; 
        
        if (FRUITS.length >= 16 && FRUITS[fruitIndex3] && FRUITS[fruitIndex2] && FRUITS[fruitIndex1]) {
             const derivedPublicKeyFruits: [Item, Item, Item] = [
                FRUITS[fruitIndex3],
                FRUITS[fruitIndex2],
                FRUITS[fruitIndex1]
            ];
            setPublicKey(derivedPublicKeyFruits);
        } else {
            console.error("Could not derive fruits for public key. Check FRUITS array and indices.", {pkNum, fruitIndex1, fruitIndex2, fruitIndex3});
            setPublicKey(null); 
        }
      }
    }
  }, [currentStage, selectedAnimal, selectedPlace, selectedObject, isLoggedIn, privateKey, publicKey]);
  
  const addTransaction = useCallback((toAddress: [Item, Item, Item], amount: number) => {
    if (!publicKey) {
      console.error("Cannot add transaction: User not fully logged in or public key missing.");
      return;
    }
    const newTransaction: Transaction = {
      fromAddress: publicKey,
      toAddress: toAddress,
      amount: amount,
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
    };
    setTransactions(prev => {
      const updatedTransactions = [...prev, newTransaction];
      localStorage.setItem('bananaTransactions', JSON.stringify(updatedTransactions));
      return updatedTransactions;
    });
  }, [publicKey]); 

  const renderStoryText = () => { // Removed context, always 'creation' for StoryPage
    let textParts: React.ReactNode[] = [];

    if (currentStage === StoryStage.SelectingAnimal && !selectedAnimal) {
      textParts.push(
        <span key="intro" className="opacity-80">Once upon a time, there was a...</span>
      );
    }
    
    if (selectedAnimal) {
       textParts = [
        <span key="s1">Once upon a time, there was a </span>,
        <strong key="animal" className="text-yellow-300 mx-1">{selectedAnimal.name} {selectedAnimal.emoji}</strong>,
        <span key="s2">.</span>
      ];
    }

    if (currentStage === StoryStage.SelectingPlace && selectedAnimal) {
      textParts.push(
        <span key="s3" className="block mt-2 opacity-80">The {selectedAnimal.name} lived in a...</span>
      );
    }

    if (selectedPlace && selectedAnimal) {
      textParts = [
        <span key="ps1">Once upon a time, there was a </span>,
        <strong key="panimal" className="text-yellow-300 mx-1">{selectedAnimal.name} {selectedAnimal.emoji}</strong>,
        <span key="ps2">. </span>,
        <span key="ps3" className="block mt-1 sm:inline sm:mt-0">The {selectedAnimal.name} lived in a </span>,
        <strong key="pplace" className="text-yellow-300 mx-1">{selectedPlace.name} {selectedPlace.emoji}</strong>,
        <span key="ps4">.</span>
      ];
    }
    
    if (currentStage === StoryStage.SelectingObject && selectedAnimal && selectedPlace) {
        textParts.push(
          <span key="s4" className="block mt-2 opacity-80">The favorite thing that the {selectedAnimal.name} loved was a...</span>
        );
    }

    if (selectedObject && selectedAnimal && selectedPlace) {
      textParts = [
        <span key="fs1">Once upon a time, there was a </span>,
        <strong key="fanimal" className="text-yellow-300 mx-1">{selectedAnimal.name} {selectedAnimal.emoji}</strong>,
        <span key="fs2">. </span>,
        <span key="fs3" className="block mt-1 sm:inline sm:mt-0">The {selectedAnimal.name} lived in a </span>,
        <strong key="fplace" className="text-yellow-300 mx-1">{selectedPlace.name} {selectedPlace.emoji}</strong>,
        <span key="fs4">. </span>,
        <span key="fs5" className="block mt-1 sm:inline sm:mt-0">The favorite thing that the {selectedAnimal.name} loved was a </span>,
        <strong key="fobject" className="text-yellow-300 mx-1">{selectedObject.name} {selectedObject.emoji}</strong>,
        <span key="fs6">.</span>
      ];
    }
    
    // Removed 'StoryVerse Portal' specific text generation for this page
    if (currentStage === StoryStage.StoryComplete) {
         if (selectedAnimal && selectedPlace && selectedObject) { 
            textParts.push(<span key="conclusion" className="block mt-2 opacity-80">And they embarked on many grand adventures!</span>);
         }
    }

    return (
      <p className="text-xl sm:text-2xl md:text-3xl font-serif text-white mb-8 text-center leading-relaxed">
        {textParts.map((part, index) => <React.Fragment key={index}>{part}</React.Fragment>)}
      </p>
    );
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 flex flex-col items-center justify-center p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-t-4 border-yellow-300"></div>
        <p className="text-white text-xl mt-4">Loading your story...</p>
      </div>
    );
  }

  const renderStoryPage = () => (
    <>
      <header className="mb-8 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center text-white drop-shadow-lg">
          Create Your Secret Story
        </h1>
      </header>

      <main className="bg-white/5 backdrop-blur-sm p-6 sm:p-8 rounded-2xl shadow-xl">
        {isLoading && (
          <div className="flex justify-center items-center my-8 h-48">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-yellow-300"></div>
          </div>
        )}

        {/* Logic for displaying logged-in "StoryVerse Portal" on this page is removed */}
        {/* User is redirected to WalletPage if logged in */}

        {!isLoading && ( // Display story creation steps if not loading and not logged in (or if logged in, they get redirected)
          <>
            <div className="story-text-container mb-8 min-h-[120px] sm:min-h-[180px] flex items-center justify-center">
              {renderStoryText()}
            </div>

            {currentStage === StoryStage.SelectingAnimal && (
              <SelectionGrid
                items={ANIMALS}
                onSelectItem={handleAnimalSelect}
                gridTitle="Choose an Animal"
              />
            )}

            {currentStage === StoryStage.SelectingPlace && (
              <SelectionGrid
                items={PLACES}
                onSelectItem={handlePlaceSelect}
                gridTitle="Choose a Home"
              />
            )}

            {currentStage === StoryStage.SelectingObject && (
              <SelectionGrid
                items={OBJECTS}
                onSelectItem={handleObjectSelect}
                gridTitle="Choose a Favorite Thing"
              />
            )}
            
            {currentStage === StoryStage.StoryComplete && (
              <>
                {privateKey && publicKey && (
                  <div className="mt-6 p-4 sm:p-6 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg text-center">
                    <h3 className="text-xl sm:text-2xl font-semibold text-yellow-300 mb-3 sm:mb-4">Your Unique Story Keys</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <p className="text-md sm:text-lg text-white">
                        <span className="font-medium opacity-80">Secret Combination Value:</span>
                        <strong className="block sm:inline sm:ml-2 text-yellow-200 text-lg sm:text-xl" aria-label={`Secret Combination Value: ${privateKey}`}>{privateKey}</strong>
                      </p>
                      <p className="text-md sm:text-lg text-white">
                        <span className="font-medium opacity-80">Public Story Code:</span>
                         {publicKey && (
                            <strong 
                                className="block sm:inline sm:ml-2 text-yellow-200 break-all text-2xl sm:text-3xl tracking-wider" 
                                aria-label={`Public Story Code: ${publicKey.map(f => f.name).join(' ')}`}
                            >
                                {publicKey.map(f => f.emoji).join('')}
                            </strong>
                          )}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-white/70 mt-4 sm:mt-5">
                      Your Secret Value is like a private password. Keep it safe! Your Public Code is your shareable story identity.
                    </p>
                  </div>
                )}
                <div className="text-center mt-8">
                  <button
                    onClick={handleStoryConfirmAndLogin}
                    disabled={!privateKey || !publicKey || isLoading}
                    className={`
                      bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl 
                      transition-all duration-300 transform hover:scale-105 
                      focus:outline-none focus:ring-2 focus:ring-green-700 focus:ring-opacity-75
                      ${(!privateKey || !publicKey || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    aria-label="Confirm your story and enter the StoryVerse"
                  >
                    Confirm & Enter StoryVerse
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </main>
    </>
  );


  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-600 flex flex-col items-center justify-center p-4 sm:p-6 font-sans selection:bg-yellow-400 selection:text-purple-900">
      <div className="w-full max-w-4xl mx-auto p-4">
        {currentPage === Page.StoryPage && renderStoryPage()}
        {currentPage === Page.TransferPage && (
          <TransferPage 
            isLoggedIn={isLoggedIn}
            publicKeyFruits={publicKey} 
            onLogout={handleLogout}
            onNavigateToMiningPage={() => navigateTo(Page.MiningPage)} 
            onAddTransaction={addTransaction} 
          />
        )}
        {currentPage === Page.MiningPage && (
          <MiningPage
            isLoggedIn={isLoggedIn}
            publicKeyFruits={publicKey}
            transactions={transactions}
            onLogout={handleLogout}
            onNavigateToWalletPage={() => navigateTo(Page.TransferPage)}
          />
        )}
        <footer className="text-center mt-8 text-white/70 text-sm">
          <p>&copy; {new Date().getFullYear()} Baby Bitcoin!</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
