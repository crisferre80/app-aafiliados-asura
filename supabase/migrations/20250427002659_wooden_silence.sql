/*
  # Update payments RLS policies

  1. Changes
    - Add new RLS policy to allow authenticated users to view all payments
    - This enables viewing payments when browsing affiliate details
  
  2. Security
    - Maintains existing policies for user-specific payment management
    - Adds read-only access for authenticated users to view all payments
*/

-- Add policy to allow authenticated users to view all payments
CREATE POLICY "Allow authenticated users to view all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (true);