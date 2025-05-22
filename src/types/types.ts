export interface Affiliate {
  id: string;
  name: string;
  document_id: string;
  phone: string;
  address: string;
  email?: string | null;
  birth_date?: string | null;
  join_date: string;
  photo_url?: string | null;
  active: boolean;
  inactive_since?: string | null; // <-- agrega esta línea
  notes?: string | null;
  created_at: string;
  
  // Marital Status
  marital_status?: 'single' | 'married' | 'divorced' | 'widowed' | 'domestic_partnership' | null;
  
  // Children
  children_count?: number | null;
  
  // Mobile Device
  has_mobile_phone?: boolean;
  
  // Employment
  employment_type?: 'formal' | 'informal' | 'unemployed' | 'retired' | 'temporary' | 'other' | null;
  employment_other_details?: string | null;
  employer_name?: string | null;
  employment_years?: number | null;
  employment_sector?: 'public' | 'private' | null;
  
  // Education
  education_level?: 'none' | 'primary_incomplete' | 'primary_complete' | 'secondary_incomplete' | 'secondary_complete' | 'tertiary_incomplete' | 'tertiary_complete' | null;
  education_status?: 'completed' | 'incomplete' | 'in_progress' | null;
  
  // Housing
  housing_situation?: 'owned' | 'rented' | 'borrowed' | 'homeless' | 'other' | null;
  housing_other_details?: string | null;
  
  // Collection Activity
  does_collection?: boolean;
  collection_materials?: string[];
  collection_sale_location?: string | null;
  collection_frequency?: string | null;
  collection_monthly_income?: number | null;
  
  // Social Benefits
  has_social_benefits?: boolean;
  social_benefits_details?: string[];
}

export interface Payment {
  id: string;
  profile_id: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid';
  payment_date?: string;
  verified_by?: string;
  verification_date?: string;
  transaction_id?: string;
  verification_notes?: string;
  // ...other properties
}

export interface PaymentVerification {
  payment_id: string;
  transaction_id: string;
  verification_notes?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthState {
  user: User | null;
  session: unknown | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  error: string | null;
}

export interface MonthlyPayment {
  month: string;
  status: 'paid' | 'pending';
  amount: number;
  payment_date?: string;
  transaction_id?: string;
  verification_date?: string;
}

export interface Activity {
  event_date: string | number | Date;
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image_url?: string;
  // ...otros campos si tienes
}