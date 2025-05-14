/*
  # Add additional affiliate information fields

  1. Changes
    - Add marital status fields
    - Add children information
    - Add mobile device information
    - Add employment information
    - Add education information
    - Add housing information
    - Add collection activity information
    - Add social benefits information

  2. Security
    - Maintain existing RLS policies
*/

-- Add new columns to affiliates table
ALTER TABLE affiliates 
  -- Marital Status (already exists from previous migration)
  ADD COLUMN IF NOT EXISTS has_mobile_phone boolean DEFAULT false,
  
  -- Employment Information (enhance existing fields)
  ADD COLUMN IF NOT EXISTS employment_type text CHECK (
    employment_type IN (
      'formal', 'informal', 'unemployed', 'retired', 
      'temporary', 'other'
    )
  ),
  ADD COLUMN IF NOT EXISTS employment_other_details text,
  
  -- Housing Information
  ADD COLUMN IF NOT EXISTS housing_situation text CHECK (
    housing_situation IN (
      'owned', 'rented', 'borrowed', 'homeless', 'other'
    )
  ),
  ADD COLUMN IF NOT EXISTS housing_other_details text,
  
  -- Collection Activity
  ADD COLUMN IF NOT EXISTS does_collection boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS collection_materials text[],
  ADD COLUMN IF NOT EXISTS collection_sale_location text,
  ADD COLUMN IF NOT EXISTS collection_frequency text,
  ADD COLUMN IF NOT EXISTS collection_monthly_income numeric,
  
  -- Social Benefits
  ADD COLUMN IF NOT EXISTS has_social_benefits boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_benefits_details text[];