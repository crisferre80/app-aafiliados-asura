import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { AuthState } from '../types/types';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isLoading: true,
  error: null,
  
  signIn: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      set({ 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
        } : null,
        session: data.session,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, user: null, session: null });
    }
  },

  signUp: async (email: string, password: string, fullName: string) => {
    try {
      set({ isLoading: true, error: null });
      
      // Check if user exists first
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('Este correo electrónico ya está registrado');
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        if (error.message === 'User already registered') {
          throw new Error('Este correo electrónico ya está registrado');
        }
        throw error;
      }

      set({ 
        user: data.user ? {
          id: data.user.id,
          email: data.user.email || '',
        } : null,
        session: data.session,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, user: null, session: null });
    }
  },
  
  signOut: async () => {
    try {
      set({ isLoading: true, error: null });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, session: null, isLoading: false, error: null });
    } catch (error: any) {
      set({ error: error.message, isLoading: false, user: null, session: null });
    }
  },
}));

// Initialize auth state by checking for existing session
export const initializeAuth = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    useAuthStore.setState({ 
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email || '',
      } : null,
      session: session,
      isLoading: false,
      error: null
    });
  } catch (error: any) {
    // Clear state and set error if session recovery fails
    useAuthStore.setState({ 
      user: null, 
      session: null, 
      isLoading: false,
      error: 'Session expired. Please sign in again.'
    });
    
    // Force sign out to clean up any invalid tokens
    await supabase.auth.signOut();
  }
  
  // Set up auth listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    try {
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        useAuthStore.setState({ 
          user: null,
          session: null,
          isLoading: false,
          error: null
        });
        return;
      }

      if (event === 'TOKEN_REFRESHED' && !session) {
        throw new Error('Failed to refresh session');
      }

      useAuthStore.setState({ 
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email || '',
        } : null,
        session: session,
        isLoading: false,
        error: null
      });
    } catch (error: any) {
      useAuthStore.setState({
        user: null,
        session: null,
        isLoading: false,
        error: 'Session expired. Please sign in again.'
      });
      
      // Force sign out on auth errors
      await supabase.auth.signOut();
    }
  });
};