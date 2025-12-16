-- Business linking migration
-- This creates a flexible system for managing different business types

-- Create managed_businesses table for user-business relationships
CREATE TABLE IF NOT EXISTS managed_businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  business_type TEXT NOT NULL, -- 'shop', 'cafe', 'cinema', 'rental', 'service'
  business_name TEXT NOT NULL,
  business_data JSONB NOT NULL DEFAULT '{}', -- Flexible storage for business-specific data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_edited_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE managed_businesses ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own businesses" ON managed_businesses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own businesses" ON managed_businesses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all businesses" ON managed_businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can update all businesses" ON managed_businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can insert businesses" ON managed_businesses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Add has_business flag to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_business BOOLEAN DEFAULT false;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_managed_businesses_user_id ON managed_businesses(user_id);
CREATE INDEX IF NOT EXISTS idx_managed_businesses_type ON managed_businesses(business_type);

-- Function to update has_business flag when business is added/removed
CREATE OR REPLACE FUNCTION update_user_has_business()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET has_business = true WHERE id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    -- Check if user still has other businesses
    UPDATE profiles 
    SET has_business = EXISTS(
      SELECT 1 FROM managed_businesses WHERE user_id = OLD.user_id
    )
    WHERE id = OLD.user_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-update has_business flag
DROP TRIGGER IF EXISTS on_business_change ON managed_businesses;
CREATE TRIGGER on_business_change
  AFTER INSERT OR DELETE ON managed_businesses
  FOR EACH ROW EXECUTE FUNCTION update_user_has_business();
