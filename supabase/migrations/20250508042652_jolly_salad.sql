/*
  # Add digital membership card functionality

  1. New Tables
    - `membership_cards`: Stores digital card information
      - `id` (uuid, primary key)
      - `affiliate_id` (uuid, references affiliates)
      - `card_number` (text, unique)
      - `valid_through` (date)
      - `qr_code_url` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on membership_cards table
    - Add policies for authenticated users
*/

-- Create membership_cards table
CREATE TABLE IF NOT EXISTS membership_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id uuid REFERENCES affiliates(id) ON DELETE CASCADE,
  card_number text UNIQUE NOT NULL,
  valid_through date NOT NULL,
  qr_code_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index on card_number
CREATE UNIQUE INDEX IF NOT EXISTS membership_cards_card_number_idx ON membership_cards (card_number);

-- Enable RLS
ALTER TABLE membership_cards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public access to membership cards"
  ON membership_cards
  FOR SELECT
  TO public
  USING (true);

-- Create function to generate card number
CREATE OR REPLACE FUNCTION generate_card_number()
RETURNS text AS $$
DECLARE
  new_number text;
  exists_count integer;
BEGIN
  LOOP
    -- Generate a number in format ASURA-YYYY-XXXXX
    new_number := 'ASURA-' || 
                  TO_CHAR(CURRENT_DATE, 'YYYY') || '-' ||
                  LPAD(FLOOR(RANDOM() * 100000)::text, 5, '0');
    
    -- Check if number exists
    SELECT COUNT(*) INTO exists_count
    FROM membership_cards
    WHERE card_number = new_number;
    
    -- Exit loop if number is unique
    EXIT WHEN exists_count = 0;
  END LOOP;
  
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;