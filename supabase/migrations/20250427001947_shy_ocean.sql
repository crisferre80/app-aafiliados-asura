/*
  # Add RLS policies for payments table

  1. Changes
    - Add RLS policies for the payments table to allow:
      - Users to view payments associated with their profile
      - Users to insert payments for their own profile
      - Users to update their own payments

  2. Security
    - Maintains RLS protection while allowing appropriate access
    - Ensures users can only access their own payment data
    - Prevents unauthorized access to other users' payment information
    - Safely handles policy creation by checking for existing policies first
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users can view their own payments'
  ) THEN
    CREATE POLICY "Users can view their own payments"
    ON public.payments
    FOR SELECT
    TO authenticated
    USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users can insert their own payments'
  ) THEN
    CREATE POLICY "Users can insert their own payments"
    ON public.payments
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'payments' 
    AND policyname = 'Users can update their own payments'
  ) THEN
    CREATE POLICY "Users can update their own payments"
    ON public.payments
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);
  END IF;
END $$;