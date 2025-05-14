/*
  # Create affiliates table

  1. New Tables
    - `affiliates`: Stores information about union members
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `name` (text)
      - `document_id` (text)
      - `phone` (text)
      - `address` (text)
      - `email` (text, nullable)
      - `birth_date` (date, nullable)
      - `join_date` (date)
      - `photo_url` (text, nullable)
      - `active` (boolean)
      - `notes` (text, nullable)

  2. Security
    - Enable RLS on the affiliates table
    - Add policy for authenticated users to read all affiliates
    - Add policy for authenticated users to insert affiliates
    - Add policy for authenticated users to update affiliates
*/

-- Create affiliates table
CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  document_id text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  email text,
  birth_date date,
  join_date date NOT NULL,
  photo_url text,
  active boolean DEFAULT true,
  notes text
);

-- Create unique index on document_id
CREATE UNIQUE INDEX IF NOT EXISTS affiliates_document_id_idx ON affiliates (document_id);

-- Enable Row Level Security
ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated users to read all affiliates"
  ON affiliates
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert affiliates"
  ON affiliates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update affiliates"
  ON affiliates
  FOR UPDATE
  TO authenticated
  USING (true);