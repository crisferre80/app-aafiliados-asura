import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient'; // Ajusta la ruta si es necesario
import type { Activity } from '../types/types';

export interface ActivityState {
  activities: Activity[];
  fetchActivities: () => Promise<void>;
  isLoading: boolean;
  deleteActivity: (id: string) => Promise<void>;
  addActivity: (activity: Omit<Activity, 'id'>) => Promise<void>;
  updateActivity: (id: string, activity: Partial<Activity>) => Promise<void>;
  uploadImage: (file: File) => Promise<string>;
}

export const useActivityStore = create<ActivityState>((set, get) => ({
  activities: [],
  isLoading: false,

  fetchActivities: async () => {
    try {
      set({ isLoading: true });
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('event_date', { ascending: true });

      if (error) throw error;
      set({ activities: data || [], isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  deleteActivity: async (id: string) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Update state
      const activities = get().activities.filter(a => a.id !== id);
      set({ activities, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addActivity: async (activity) => {
    // Si tienes backend, haz el POST aquí
    // const { data } = await supabase.from('activities').insert([activity]).select().single();
    // set((state) => ({ activities: [data, ...state.activities] }));

    // Si es local:
    const newActivity = { ...activity, id: Math.random().toString(36).substr(2, 9) };
    set((state) => ({ activities: [newActivity, ...state.activities] }));
  },

  updateActivity: async (id, activity) => {
    // Si tienes backend, haz el UPDATE aquí
    // await supabase.from('activities').update(activity).eq('id', id);

    set((state) => ({
      activities: state.activities.map((a) =>
        a.id === id ? { ...a, ...activity } : a
      ),
    }));
  },

  uploadImage: async (file) => {
    // Aquí deberías subir la imagen a tu backend o a un servicio como Cloudinary/Supabase Storage
    // y devolver la URL resultante.
    // Por ahora, solo simula una URL local:
    return URL.createObjectURL(file);
  },
}));