/*
  # Create activities table

  1. New Tables
    - `activities`: Stores information about union activities
      - `id` (uuid, primary key)
      - `created_at` (timestamptz)
      - `title` (text)
      - `description` (text)
      - `date` (date)
      - `location` (text)
      - `image_url` (text, nullable)

  2. Security
    - Enable RLS on the activities table
    - Add policy for authenticated users to read all activities
    - Add policy for authenticated users to insert activities
    - Add policy for authenticated users to update activities
*/

-- Create activities table
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  date date NOT NULL,
  location text NOT NULL,
  image_url text
);

-- Enable Row Level Security
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users
CREATE POLICY "Allow authenticated users to read all activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update activities"
  ON activities
  FOR UPDATE
  TO authenticated
  USING (true);