export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      affiliates: {
        Row: {
          id: string
          created_at: string
          name: string
          document_id: string
          phone: string
          address: string
          email: string | null
          birth_date: string | null
          join_date: string
          photo_url: string | null
          active: boolean
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          document_id: string
          phone: string
          address: string
          email?: string | null
          birth_date?: string | null
          join_date: string
          photo_url?: string | null
          active?: boolean
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          document_id?: string
          phone?: string
          address?: string
          email?: string | null
          birth_date?: string | null
          join_date?: string
          photo_url?: string | null
          active?: boolean
          notes?: string | null
        }
      }
      activities: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string
          date: string
          location: string
          image_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description: string
          date: string
          location: string
          image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string
          date?: string
          location?: string
          image_url?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Import and initialize the Supabase client
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvikszgcoclrzvseflhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWtzemdjb2Nscnp2c2VmbGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODM2NzIsImV4cCI6MjA1OTk1OTY3Mn0._OK4_ZJUGFUCFM3t-gRSUpYW7goNw_Ug7wWb5BkCrEw';

// Export the Supabase client for use in the app
export const supabase = createClient<Database>(supabaseUrl, supabaseKey);