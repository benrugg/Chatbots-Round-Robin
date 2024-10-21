### Local Dev Setup

To run this app locally, you'll need to set up a Subabase project and DB:

1. Create a new project at [supabase.com](https://supabase.com/)
2. Get the Project URL and API key, and add them a new `.env.local`
3. Run the statements in `seeds.sql` in Supabase to create the tables
4. Run `npm install` and `npm run dev`

#### .env.local example

NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxxxxxxx
