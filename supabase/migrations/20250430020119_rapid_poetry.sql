/*
  # Add payment verification fields

  1. Changes
    - Add transaction_id field for payment verification
    - Add verification metadata fields
    - Add verification audit fields

  2. Security
    - Maintain existing RLS policies
*/

-- Add verification fields to payments table
ALTER TABLE payments
  ADD COLUMN IF NOT EXISTS transaction_id text,
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS verification_date timestamptz,
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Create index on transaction_id for faster lookups
CREATE INDEX IF NOT EXISTS payments_transaction_id_idx ON payments (transaction_id);

-- Create function to log payment verifications
CREATE OR REPLACE FUNCTION log_payment_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'paid' AND OLD.status = 'pending' THEN
    INSERT INTO payment_verifications (
      payment_id,
      verified_by,
      transaction_id,
      verification_notes
    ) VALUES (
      NEW.id,
      NEW.verified_by,
      NEW.transaction_id,
      NEW.verification_notes
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create payment verifications audit table
CREATE TABLE IF NOT EXISTS payment_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id uuid REFERENCES payments(id) ON DELETE CASCADE,
  verified_by uuid REFERENCES auth.users(id),
  transaction_id text,
  verification_notes text,
  created_at timestamptz DEFAULT now()
);

-- Create trigger for logging verifications
CREATE TRIGGER log_payment_verification_trigger
  AFTER UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION log_payment_verification();

-- Enable RLS on payment_verifications
ALTER TABLE payment_verifications ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for payment_verifications
CREATE POLICY "Allow authenticated users to view payment verifications"
  ON payment_verifications
  FOR SELECT
  TO authenticated
  USING (true);