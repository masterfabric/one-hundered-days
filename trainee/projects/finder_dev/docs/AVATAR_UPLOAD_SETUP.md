# Avatar Upload Setup

The Supabase Storage bucket must be created for the avatar upload feature to work.

## Creating Supabase Storage Bucket

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. Click on the **Storage** tab
3. Click the **New bucket** button
4. Bucket name: `avatars`
5. Check the **Public bucket** option (avatars will be publicly accessible)
6. Click the **Create bucket** button

## Storage Policies (RLS)

After creating the bucket, add RLS policies so users can only upload their own avatars:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Public can read avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');
```

## Alternative: Simple URL Upload

If you don't want to use Supabase Storage, users can enter an avatar URL. In this case, you can save the URL directly to the database instead of using the `uploadAvatar` function.
