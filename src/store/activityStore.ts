import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Activity } from '../types/types';

interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: () => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id' | 'created_at'>) => Promise<string | null>;
  updateActivity: (id: string, updates: Partial<Activity>) => Promise<void>;
  uploadImage: (file: File) => Promise<string | null>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,
  error: null,

  fetchActivities: async () => {
    try {
      set({ isLoading: true, error: null });
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      set({ activities: data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addActivity: async (activity) => {
    try {
      set({ isLoading: true, error: null });
      
      // Format the date properly
      const formattedActivity = {
        ...activity,
        event_date: new Date(activity.event_date).toISOString(),
      };

      const { data, error } = await supabase
        .from('activities')
        .insert([formattedActivity])
        .select();

      if (error) throw error;

      // Update state with the new activity
      const activities = get().activities;
      set({ 
        activities: [...activities, ...(data || [])], 
        isLoading: false 
      });
      
      return data?.[0]?.id || null;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  updateActivity: async (id, updates) => {
    try {
      set({ isLoading: true, error: null });
      
      // Format the date if it's being updated
      const formattedUpdates = {
        ...updates,
        event_date: updates.event_date ? new Date(updates.event_date).toISOString() : undefined,
      };

      const { error } = await supabase
        .from('activities')
        .update(formattedUpdates)
        .eq('id', id);

      if (error) throw error;

      // Update state
      const activities = get().activities.map(a => 
        a.id === id ? { ...a, ...updates } : a
      );
      
      set({ activities, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  uploadImage: async (file) => {
    try {
      set({ isLoading: true, error: null });
      
      // Generate a unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `activity-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('activities')
        .upload(filePath, file);

      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage
        .from('activities')
        .getPublicUrl(filePath);
        
      set({ isLoading: false });
      return data.publicUrl;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      return null;
    }
  }
}));