# Avatar Upload Setup

Avatar yükleme özelliğinin çalışması için Supabase Storage bucket'ının oluşturulması gerekmektedir.

## Supabase Storage Bucket Oluşturma

1. **Supabase Dashboard'a gidin**: https://app.supabase.com
2. **Storage** sekmesine tıklayın
3. **New bucket** butonuna tıklayın
4. Bucket adı: `avatars`
5. **Public bucket** seçeneğini işaretleyin (avatar'lar herkese açık olacak)
6. **Create bucket** butonuna tıklayın

## Storage Policies (RLS)

Bucket oluşturulduktan sonra, kullanıcıların sadece kendi avatar'larını yükleyebilmesi için RLS politikaları ekleyin:

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

## Alternatif: Basit URL Yükleme

Eğer Supabase Storage kullanmak istemiyorsanız, kullanıcılar avatar URL'i girebilir. Bu durumda `uploadAvatar` fonksiyonunu kullanmak yerine direkt URL'i veritabanına kaydedebilirsiniz.
