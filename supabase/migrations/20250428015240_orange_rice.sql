/*
  # Fix payments table RLS policies

  1. Changes
    - Remove existing RLS policies for payments table that are causing conflicts
    - Add new, clearer RLS policies for payments table:
      - Allow users to view their own payments
      - Allow users to view payments of affiliates
      - Allow users to insert their own payments
      - Allow users to update their own payments

  2. Security
    - Maintains RLS protection while fixing access issues
    - Ensures proper access control for payment records
*/

-- Drop existing conflicting policies
DROP POLICY IF EXISTS "Users can view affiliate payments" ON payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON payments;

-- Create new, clearer policies
CREATE POLICY "Enable read access for users own payments"
ON payments FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM affiliates 
    WHERE affiliates.id = payments.profile_id
  )
);

CREATE POLICY "Enable insert access for users own payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Enable update access for users own payments"
ON payments FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());