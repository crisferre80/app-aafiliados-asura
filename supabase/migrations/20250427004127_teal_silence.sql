/*
  # Add RLS policies for payments table

  1. Changes
    - Add RLS policies for payments table to allow:
      - Users to insert their own payments
      - Users to view their own payments
      - Users to update their own payments

  2. Security
    - Enable RLS on payments table (if not already enabled)
    - Add policies for authenticated users to:
      - INSERT: Only if profile_id matches their user ID
      - SELECT: Only if profile_id matches their user ID
      - UPDATE: Only if profile_id matches their user ID
*/

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing conflicting policies if they exist
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Allow authenticated users to view all payments" ON payments;
    DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
    DROP POLICY IF EXISTS "Users can update their own payments" ON payments;
EXCEPTION
    WHEN undefined_object THEN 
        NULL;
END $$;

-- Create new policies
CREATE POLICY "Users can view their own payments"
ON payments FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

CREATE POLICY "Users can insert their own payments"
ON payments FOR INSERT
TO authenticated
WITH CHECK (profile_id = auth.uid());

CREATE POLICY "Users can update their own payments"
ON payments FOR UPDATE
TO authenticated
USING (profile_id = auth.uid())
WITH CHECK (profile_id = auth.uid());