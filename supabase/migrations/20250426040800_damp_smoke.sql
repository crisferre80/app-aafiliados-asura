/*
  # Create storage buckets and policies

  1. Storage Buckets
    - `affiliates`: Stores affiliate photos
    - `activities`: Stores activity images

  2. Security
    - Enable policies for authenticated users to upload and download files
    - Add appropriate security settings
*/

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('affiliates', 'affiliates', true),
  ('activities', 'activities', true)
ON CONFLICT (id) DO NOTHING;

-- Policies for affiliates bucket
CREATE POLICY "Allow authenticated users to select from affiliates bucket"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'affiliates');

CREATE POLICY "Allow authenticated users to insert to affiliates bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'affiliates');

CREATE POLICY "Allow authenticated users to update in affiliates bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'affiliates');

-- Policies for activities bucket
CREATE POLICY "Allow authenticated users to select from activities bucket"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'activities');

CREATE POLICY "Allow authenticated users to insert to activities bucket"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'activities');

CREATE POLICY "Allow authenticated users to update in activities bucket"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'activities');

-- Public access policies for both buckets
CREATE POLICY "Give public access to affiliate photos"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'affiliates');

CREATE POLICY "Give public access to activity images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'activities');