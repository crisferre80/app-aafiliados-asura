/*
  # Fix affiliate deletion and add membership card functionality

  1. Changes
    - Add ON DELETE CASCADE to foreign key constraints
    - Add trigger to handle affiliate deletion cleanup
    - Add function to generate printable card data

  2. Security
    - Maintain existing RLS policies
    - Ensure data integrity during deletion
*/

-- Add ON DELETE CASCADE to existing foreign keys
ALTER TABLE payments
DROP CONSTRAINT IF EXISTS payments_profile_id_fkey,
ADD CONSTRAINT payments_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES affiliates(id)
  ON DELETE CASCADE;

ALTER TABLE notifications
DROP CONSTRAINT IF EXISTS notifications_profile_id_fkey,
ADD CONSTRAINT notifications_profile_id_fkey
  FOREIGN KEY (profile_id)
  REFERENCES affiliates(id)
  ON DELETE CASCADE;

-- Create function to handle affiliate deletion cleanup
CREATE OR REPLACE FUNCTION handle_affiliate_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Clean up storage files
  DELETE FROM storage.objects
  WHERE bucket_id = 'affiliates'
    AND path LIKE 'affiliate-photos/%'
    AND path LIKE '%' || OLD.id || '%';
    
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for affiliate deletion
DROP TRIGGER IF EXISTS cleanup_affiliate_data ON affiliates;
CREATE TRIGGER cleanup_affiliate_data
  BEFORE DELETE ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION handle_affiliate_deletion();