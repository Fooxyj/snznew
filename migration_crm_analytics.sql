-- Create business_stats table for CRM analytics

-- 1. Create table
CREATE TABLE IF NOT EXISTS business_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID REFERENCES managed_businesses(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    views INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    orders INTEGER DEFAULT 0,
    revenue DECIMAL(10, 2) DEFAULT 0,
    UNIQUE(business_id, date)
);

-- 2. Enable RLS
ALTER TABLE business_stats ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Only the owner of the business can view stats
CREATE POLICY "Owners can view their business stats"
    ON business_stats FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM managed_businesses mb
            WHERE mb.id = business_stats.business_id
            AND mb.user_id = auth.uid()
        )
    );

-- 4. Create function to increment stats
CREATE OR REPLACE FUNCTION increment_business_stat(
    p_business_id UUID,
    p_stat_type TEXT -- 'views', 'clicks', 'orders'
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO business_stats (business_id, date, views, clicks, orders)
    VALUES (
        p_business_id, 
        CURRENT_DATE, 
        CASE WHEN p_stat_type = 'views' THEN 1 ELSE 0 END,
        CASE WHEN p_stat_type = 'clicks' THEN 1 ELSE 0 END,
        CASE WHEN p_stat_type = 'orders' THEN 1 ELSE 0 END
    )
    ON CONFLICT (business_id, date)
    DO UPDATE SET
        views = business_stats.views + CASE WHEN p_stat_type = 'views' THEN 1 ELSE 0 END,
        clicks = business_stats.clicks + CASE WHEN p_stat_type = 'clicks' THEN 1 ELSE 0 END,
        orders = business_stats.orders + CASE WHEN p_stat_type = 'orders' THEN 1 ELSE 0 END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Add dummy data for testing (optional, can be removed)
-- Insert stats for the last 7 days for existing businesses
DO $$
DECLARE
    b_id UUID;
    i INTEGER;
BEGIN
    FOR b_id IN SELECT id FROM managed_businesses LOOP
        FOR i IN 0..6 LOOP
            INSERT INTO business_stats (business_id, date, views, clicks, orders, revenue)
            VALUES (
                b_id,
                CURRENT_DATE - i,
                floor(random() * 50 + 10)::int,
                floor(random() * 10 + 1)::int,
                floor(random() * 3)::int,
                floor(random() * 5000)::decimal
            )
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;
END $$;
