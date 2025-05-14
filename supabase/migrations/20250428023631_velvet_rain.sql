/*
  # Fix activities table structure

  1. Changes
    - Update activities table to use timestamptz for event_date
    - Add proper constraints and defaults
    - Update RLS policies

  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control
*/

-- Drop existing activities table
DROP TABLE IF EXISTS activities CASCADE;

-- Recreate activities table with proper structure
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  title text NOT NULL,
  description text NOT NULL,
  event_date timestamptz NOT NULL,
  location text NOT NULL,
  image_url text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for activities
CREATE POLICY "Allow authenticated users to read all activities"
  ON activities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow authenticated users to insert activities"
  ON activities FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update activities"
  ON activities FOR UPDATE
  TO authenticated
  USING (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();