import { create } from 'zustand';
import { supabase } from '../types/supabase'; // Ajusta la ruta si es necesario
import type { Affiliate } from '../types/types';

interface AffiliateState {
  affiliates: Affiliate[];
  isLoading: boolean;
  error: string | null;
  fetchAffiliates: (province?: string) => Promise<void>;
  addAffiliate: (affiliate: Omit<Affiliate, 'id' | 'created_at'>) => Promise<string | null>;
  updateAffiliate: (id: string, updates: Partial<Affiliate>) => Promise<void>;
  deleteAffiliate: (id: string) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string | null>;
}

export const useAffiliateStore = create<AffiliateState>((set, get) => ({
  affiliates: [],
  isLoading: false,
  error: null,

  fetchAffiliates: async (province = 'Santiago del Estero') => {
    set({ isLoading: true, affiliates: [] }); // Limpiar afiliados antes de cada fetch
    if (!province || province === '') {
      set({ affiliates: [], isLoading: false, error: null });
      return;
    }
    const { data, error } = await supabase
      .from('affiliates')
      .select('*')
      .eq('province', province);

    set({ affiliates: data || [], isLoading: false, error: error?.message || null });
  },

  addAffiliate: async (affiliate) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('affiliates')
        .insert([{ ...affiliate, province: 'Santiago del Estero' }])
        .select();

      if (error) throw error;

      const affiliates = get().affiliates;
      set({ 
        affiliates: [...affiliates, ...(data || [])], 
        isLoading: false 
      });
      
      return data?.[0]?.id || null;
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: String(error), isLoading: false });
      }
      return null;
    }
  },

  updateAffiliate: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase
        .from('affiliates')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      const affiliates = get().affiliates.map(a => 
        a.id === id ? { ...a, ...updates } : a
      );
      
      set({ affiliates, isLoading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: String(error), isLoading: false });
      }
    }
  },

  deleteAffiliate: async (id: string) => {
    set({ isLoading: true });
    const { error } = await supabase.from('affiliates').delete().eq('id', id);
    if (error) {
      set({ error: error.message, isLoading: false });
      throw new Error(error.message);
    }
    // Refresca la lista después de borrar
    await get().fetchAffiliates();
    set({ isLoading: false });
  },

  uploadPhoto: async (file) => {
    try {
      set({ isLoading: true, error: null });
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `affiliate-photos/${fileName}`;
      
      const { error } = await supabase.storage
        .from('affiliates')
        .upload(filePath, file);

      if (error) throw error;
      
      const { data } = supabase.storage
        .from('affiliates')
        .getPublicUrl(filePath);
        
      set({ isLoading: false });
      return data.publicUrl;
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: String(error), isLoading: false });
      }
      return null;
    }
  },
}));

// En affiliateStore.ts o donde manejes las solicitudes al backend
export const deleteAffiliate = async (id: string) => {
  const response = await fetch(`/api/affiliates/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar el afiliado');
  }
};