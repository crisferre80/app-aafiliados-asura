/*
  # Fix payments table and RLS policies

  1. Changes
    - Recreate payments table with proper structure
    - Set up correct RLS policies
    - Add function for automatic payment generation

  2. Security
    - Enable RLS on payments table
    - Add policies for authenticated users
*/

-- Recreate payments table with proper structure
DROP TABLE IF EXISTS payments CASCADE;

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES affiliates(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid')),
  payment_date timestamptz,
  due_date timestamptz NOT NULL,
  payment_method text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments
CREATE POLICY "Allow authenticated users to view all payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Allow users to insert payments"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow users to update payments"
  ON payments FOR UPDATE
  TO authenticated
  USING (true);

-- Create function to generate monthly payments
CREATE OR REPLACE FUNCTION generate_monthly_payments(
  affiliate_id uuid,
  start_date date,
  amount numeric DEFAULT 7000
)
RETURNS void AS $$
DECLARE
  curr_date date;
  end_date date;
BEGIN
  curr_date := start_date;
  end_date := CURRENT_DATE;
  
  WHILE curr_date <= end_date LOOP
    -- Check if payment already exists for this month
    IF NOT EXISTS (
      SELECT 1 FROM payments 
      WHERE profile_id = affiliate_id 
      AND date_trunc('month', due_date) = date_trunc('month', curr_date)
    ) THEN
      INSERT INTO payments (
        profile_id,
        amount,
        due_date
      ) VALUES (
        affiliate_id,
        amount,
        curr_date + INTERVAL '5 days'
      );
    END IF;
    
    curr_date := curr_date + INTERVAL '1 month';
  END LOOP;
END;
$$ LANGUAGE plpgsql;