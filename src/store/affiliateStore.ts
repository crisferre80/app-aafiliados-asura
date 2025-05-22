import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Affiliate } from '../types/types';

interface AffiliateState {
  affiliates: Affiliate[];
  isLoading: boolean;
  error: string | null;
  fetchAffiliates: () => Promise<void>;
  addAffiliate: (affiliate: Omit<Affiliate, 'id' | 'created_at'>) => Promise<string | null>;
  updateAffiliate: (id: string, updates: Partial<Affiliate>) => Promise<void>;
  deleteAffiliate: (id: string) => Promise<void>;
  uploadPhoto: (file: File) => Promise<string | null>;
}

export const useAffiliateStore = create<AffiliateState>((set, get) => ({
  affiliates: [],
  isLoading: false,
  error: null,

  fetchAffiliates: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('name');

      if (error) throw error;
      set({ affiliates: data || [], isLoading: false });
    } catch (error: unknown) {
      if (error instanceof Error) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ error: String(error), isLoading: false });
      }
    }
  },

  addAffiliate: async (affiliate) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('affiliates')
        .insert([affiliate])
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

  deleteAffiliate: async (id) => {
    try {
      set({ isLoading: true, error: null });

      // Verifica si el afiliado existe
      const affiliate = get().affiliates.find(a => a.id === id);
      if (!affiliate) {
        throw new Error('Afiliado no encontrado');
      }

      // Elimina la foto del afiliado si existe
      if (affiliate.photo_url) {
        const photoPath = affiliate.photo_url.split('/').pop();
        if (photoPath) {
          const { error: storageError } = await supabase.storage
            .from('affiliates')
            .remove([`affiliate-photos/${photoPath}`]);

          if (storageError) {
            console.error('Error al eliminar la foto:', storageError);
            throw storageError;
          }
        }
      }

      // Elimina el registro del afiliado
      const { error } = await supabase
        .from('affiliates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error al eliminar el afiliado:', error);
        throw error;
      }

      // Actualiza el estado local
      const affiliates = get().affiliates.filter(a => a.id !== id);
      set({ affiliates, isLoading: false });
      console.log('Afiliado eliminado con éxito:', id);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error en deleteAffiliate:', error.message);
        set({ error: error.message, isLoading: false });
      } else {
        console.error('Error en deleteAffiliate:', String(error));
        set({ error: String(error), isLoading: false });
      }
    }
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
  }
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

// Removed unused useState import to resolve the error
// Removed unused handleDelete function to resolve the error