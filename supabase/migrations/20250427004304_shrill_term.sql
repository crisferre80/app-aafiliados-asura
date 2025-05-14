/*
  # Update payments table RLS policies

  1. Changes
    - Add new RLS policy to allow authenticated users to view payments for affiliates
    - Keep existing policies for users managing their own payments

  2. Security
    - Maintains existing RLS policies for user-specific operations
    - Adds new policy for viewing affiliate payments
    - Ensures authenticated users can only view payments
*/

-- Drop existing select policy
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;

-- Create new select policies
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
TO authenticated
USING (
  profile_id = auth.uid()
);

CREATE POLICY "Users can view affiliate payments"
ON payments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM affiliates
    WHERE id = payments.profile_id
  )
);