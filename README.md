# Haus Kulture PNG

A community archive for traditional song lyrics and recordings, attire, dance, and local places in Papua New Guinea. Built with Expo Router, React Native, and Supabase.

## Run locally

1. Create a Supabase project and copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` using the project URL and publishable/anon key from the Supabase dashboard. These are public client credentials; never use a service-role key in the app.
3. Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor. This creates the private `cultural-media` storage bucket and its RLS policies as well as the database tables and policies. If uploads show “Bucket not found”, this script has not been applied to the Supabase project configured in `.env`.
4. Install packages and start Expo:

   ```sh
   npm install
   npx expo start
   ```

The app uses Supabase Auth with persistent AsyncStorage sessions. Expo Router protected stacks gate all archive screens and detail routes. The main tab bar has Home, Archive, Places, and Profile; songs, attire, and dance are additional archive screens, while contribution and detail views are pushed on the app stack.

The Songs, Attire, Dance, and Places collections can be browsed by PNG's four regions and their provinces. Contributions and edits use the same province list so archive filters match consistently.

Contributions can include lyrics, photos, video, and audio. Members can read published entries and their own submissions, edit or delete only their own entries, and upload media only to their own storage folder. Editing a published entry returns it to `pending` review. Media is stored in the private `cultural-media` bucket and served through short-lived signed URLs only to readers allowed by RLS. Reviewers should change approved records to `published` in Supabase; row-level security prevents contributors from publishing their own submissions.

Configure moderation and community consent processes before opening contributions to the public.
