import { Affiliate } from './Affiliate'; // Import the Affiliate type
import { create } from 'zustand'; // Import the create function from zustand

export interface AffiliateState {
  affiliates: Affiliate[];
  isLoading: boolean;
  error: string | null;
  setAffiliates: (affiliates: Affiliate[]) => void; // Add this line
  // Other properties...
}

export const useAffiliateStore = create<AffiliateState>((set) => ({
  affiliates: [],
  fetchAffiliates: async () => {
    // Implement the function logic here
    console.log('Fetching affiliates...');
  },
  setAffiliates: (affiliates: Affiliate[]) => {
    set({ affiliates });
  },
  updateAffiliate: async (id: string, data: Partial<Affiliate>) => {
    console.log(`Updating affiliate with id: ${id}`, data);
    // Add logic to update the affiliate here
  },
  isLoading: false,
  error: null,
  set, // Add the set function to the state
}));