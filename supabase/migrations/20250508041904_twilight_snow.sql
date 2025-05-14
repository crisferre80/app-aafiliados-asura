/*
  # Add role column to profiles table

  1. Changes
    - Add `role` column to `profiles` table with type `text`
    - Set default value to 'affiliate'
    - Add check constraint to ensure valid roles
    - Update existing rows to have 'affiliate' role

  2. Security
    - No changes to RLS policies needed
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'role'
  ) THEN
    ALTER TABLE profiles 
    ADD COLUMN role text NOT NULL DEFAULT 'affiliate'
    CHECK (role IN ('admin', 'affiliate'));

    -- Set all existing users to 'affiliate' role
    UPDATE profiles SET role = 'affiliate';
  END IF;
END $$;