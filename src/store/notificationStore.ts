import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import type { Notification } from '../types/types';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  subscribeToNotifications: (userId: string) => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('profile_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const unreadCount = (data || []).filter(n => !n.read).length;

      set({ 
        notifications: data || [], 
        unreadCount,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      set({ isLoading: true, error: null });

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      const notifications = get().notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );

      set({ 
        notifications,
        unreadCount: notifications.filter(n => !n.read).length,
        isLoading: false 
      });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  subscribeToNotifications: (userId: string) => {
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `profile_id=eq.${userId}`
        },
        async (payload) => {
          const { notifications, unreadCount } = get();
          const newNotification = payload.new as Notification;
          
          set({
            notifications: [newNotification, ...notifications],
            unreadCount: unreadCount + 1
          });

          // Show browser notification if supported
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('ASURA - Nueva Notificación', {
              body: newNotification.message,
              icon: 'https://res.cloudinary.com/dhvrrxejo/image/upload/v1744998417/asura_logo_alfa_1_ct0uis.png'
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  unsubscribeFromNotifications: () => {
    supabase.removeChannel('notifications');
  }
}));