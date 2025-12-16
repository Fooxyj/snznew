# Database Migration Instructions

## Important: Run these SQL commands in your Supabase SQL Editor

Before testing the new features, you need to create the necessary database tables.

### Steps:

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the contents of `supabase_migrations.sql`
5. Click **Run** to execute the migration

### What this creates:

- **`news` table**: Stores news articles with title, content, images, etc.
- **`business_applications` table**: Stores business partner applications
- **RLS Policies**: Ensures proper security (users can only see their own applications, admins can see all)

### Verification:

After running the migration, verify in the **Table Editor**:
- You should see `news` and `business_applications` tables
- Check that RLS is enabled on both tables

### Note:

Make sure you have the `profiles` table with an `is_admin` column for the admin policies to work correctly.
