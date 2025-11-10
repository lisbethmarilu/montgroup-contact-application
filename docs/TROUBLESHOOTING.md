# Troubleshooting Guide

## PostgREST Schema Error (PGRST106)

If you're getting the error: `The schema must be one of the following: public, graphql_public`

This means PostgREST hasn't recognized your tables yet. Follow these steps:

### Step 1: Refresh PostgREST Schema Cache

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Run this command:

```sql
NOTIFY pgrst, 'reload schema';
```

### Step 2: Verify Tables Exist

Run this query to verify your tables are in the `public` schema:

```sql
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'accounts', 'sessions', 'verification_tokens')
ORDER BY table_name;
```

You should see all 4 tables listed.

### Step 3: Check PostgREST Configuration

1. Go to **Project Settings** → **API** → **PostgREST**
2. Ensure the **Schema** setting includes `public`
3. The default should be: `public, graphql_public`

### Step 4: Verify Service Role Key

Make sure your `.env.local` has the correct `SUPABASE_SERVICE_ROLE_KEY`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

The service role key should start with `eyJ...` and is found in:
**Project Settings** → **API** → **service_role** (secret)

### Step 5: Test the Connection

After refreshing PostgREST, try the OAuth flow again. The error should be resolved.

## If the Error Persists

If you still get the error after refreshing PostgREST:

1. **Check if tables are accessible via PostgREST:**
   - Go to **API** → **REST** in Supabase Dashboard
   - Try accessing: `https://your-project.supabase.co/rest/v1/users`
   - You should see a response (even if empty)

2. **Verify RLS policies:**
   - The service role key should bypass RLS
   - But check that tables have proper permissions

3. **Check Supabase project status:**
   - Ensure your project is active and not paused
   - Check for any service disruptions

4. **Re-run the migration:**
   - If tables don't exist, re-run the migration SQL
   - Then refresh PostgREST again

