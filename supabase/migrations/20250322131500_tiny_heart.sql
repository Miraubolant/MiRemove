/*
  # Remove Billing System
  
  1. Changes
    - Drop billing_templates table and related objects
    - Drop billing_fields table and related objects
    - Drop invoices table and related objects
    - Remove all related triggers and functions
    - Clean up any related policies
    
  2. Security
    - Safe removal of all components
    - Use DO blocks for conditional drops
*/

DO $$ 
BEGIN
  -- Drop tables if they exist (this will cascade to related objects)
  DROP TABLE IF EXISTS billing_fields CASCADE;
  DROP TABLE IF EXISTS invoices CASCADE;
  DROP TABLE IF EXISTS billing_templates CASCADE;

  -- Drop triggers if they exist
  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_billing_templates_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_billing_templates_updated_at ON billing_templates;
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_invoices_updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
  END IF;
END $$;