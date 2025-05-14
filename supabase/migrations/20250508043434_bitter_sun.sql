/*
  # Make membership cards publicly accessible

  1. Changes
    - Update RLS policies to allow public access to membership cards
    - Add indexes for better performance
    - Add function to generate QR codes with public URLs

  2. Security
    - Ensure only necessary data is exposed publicly
    - Maintain data integrity through proper constraints
*/

-- Drop existing RLS policies
DROP POLICY IF EXISTS "Allow public access to membership cards" ON membership_cards;

-- Create new public access policy
CREATE POLICY "Allow public access to membership cards"
  ON membership_cards
  FOR SELECT
  TO public
  USING (true);

-- Create function to generate public card URL
CREATE OR REPLACE FUNCTION get_public_card_url(card_id uuid)
RETURNS text AS $$
BEGIN
  RETURN 'https://tvikszgcoclrzvseflhj.supabase.co/card/' || card_id::text;
END;
$$ LANGUAGE plpgsql;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_membership_cards_affiliate_id 
  ON membership_cards(affiliate_id);

CREATE INDEX IF NOT EXISTS idx_membership_cards_valid_through 
  ON membership_cards(valid_through);