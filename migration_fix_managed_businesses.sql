-- Add status column to managed_businesses if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'managed_businesses' AND column_name = 'status') THEN
        ALTER TABLE managed_businesses ADD COLUMN status text DEFAULT 'active';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'managed_businesses' AND column_name = 'business_type') THEN
        ALTER TABLE managed_businesses ADD COLUMN business_type text DEFAULT 'shop';
    END IF;
END $$;

-- Refresh schema cache hint (usually handled by client, but good to have the migration)
