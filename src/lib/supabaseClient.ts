import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvikszgcoclrzvseflhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2aWtzemdjb2Nscnp2c2VmbGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzODM2NzIsImV4cCI6MjA1OTk1OTY3Mn0._OK4_ZJUGFUCFM3t-gRSUpYW7goNw_Ug7wWb5BkCrEw';
export const supabase = createClient(supabaseUrl, supabaseKey);


