export enum StoryStage {
  SelectingAnimal,
  SelectingPlace,
  SelectingObject, // Added new stage
  StoryComplete,
}

export interface Item {
  id: string;
  name: string;
  emoji: string;
}

export enum Page {
  StoryPage,
  TransferPage,
  MiningPage, // Added MiningPage
}

export interface Transaction {
  id: string;
  fromAddress: [Item, Item, Item];
  toAddress: [Item, Item, Item];
  amount: number;
  timestamp: string;
}
