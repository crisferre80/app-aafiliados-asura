/*
  # Update affiliates table and create notifications system

  1. Changes to affiliates table
    - Add family information columns
    - Add educational information columns
    - Add employment information columns

  2. New Tables
    - `notifications`: Stores system notifications
    - `notification_types`: Stores notification type configurations

  3. Security
    - Enable RLS on new tables
    - Add appropriate policies for authenticated users
*/

-- Add new columns to affiliates table
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS children_count integer;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS marital_status text CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed'));

-- Education information
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS education_level text CHECK (education_level IN ('primary', 'secondary', 'tertiary', 'university'));
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS education_status text CHECK (education_status IN ('completed', 'incomplete', 'in_progress'));
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS education_completion_year integer;

-- Employment information
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS employment_status text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS employer_name text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS job_type text;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS employment_years integer;
ALTER TABLE affiliates ADD COLUMN IF NOT EXISTS employment_sector text CHECK (employment_sector IN ('public', 'private'));

-- Create notification types table
CREATE TABLE IF NOT EXISTS notification_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  template text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES affiliates(id),
  type_id uuid NOT NULL REFERENCES notification_types(id),
  title text NOT NULL,
  message text NOT NULL,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Policies for notification_types
CREATE POLICY "Allow authenticated users to read notification types"
  ON notification_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id);

-- Insert default notification types
INSERT INTO notification_types (name, description, template) VALUES
  ('due_payment', 'Payment due notification', 'Your payment of ${amount} is due on ${date}'),
  ('overdue_payment', 'Overdue payment notification', 'Your payment of ${amount} was due on ${date}'),
  ('payment_received', 'Payment received confirmation', 'Payment of ${amount} was received on ${date}'),
  ('system_update', 'System update notification', '${message}')
ON CONFLICT DO NOTHING;