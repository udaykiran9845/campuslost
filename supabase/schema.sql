-- ============================================================
-- Campus Lost & Found Portal — Database Schema
-- Run this in your Supabase SQL Editor (supabase.com/dashboard)
-- ============================================================

-- Profiles table (mirrors auth.users with extra fields)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Items table
CREATE TABLE IF NOT EXISTS items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('lost', 'found')),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN (
    'wallet', 'id_card', 'phone', 'keys', 'bag', 'laptop', 'glasses', 'other'
  )),
  location TEXT,
  date_occurred DATE,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'claimed', 'resolved')),
  posted_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Claims table
CREATE TABLE IF NOT EXISTS claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID NOT NULL REFERENCES items ON DELETE CASCADE,
  claimant_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (item_id, claimant_id)
);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE claims ENABLE ROW LEVEL SECURITY;

-- Drop existing policies before recreating (safe to re-run)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Items are viewable by everyone" ON items;
DROP POLICY IF EXISTS "Authenticated users can post items" ON items;
DROP POLICY IF EXISTS "Owners can update their items" ON items;
DROP POLICY IF EXISTS "Claimants and item owners can view claims" ON claims;
DROP POLICY IF EXISTS "Authenticated users can create claims" ON claims;
DROP POLICY IF EXISTS "Item owners can update claim status" ON claims;

-- Profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Items
CREATE POLICY "Items are viewable by everyone"
  ON items FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post items"
  ON items FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Owners can update their items"
  ON items FOR UPDATE USING (auth.uid() = posted_by);

-- Claims
CREATE POLICY "Claimants and item owners can view claims"
  ON claims FOR SELECT USING (
    auth.uid() = claimant_id
    OR auth.uid() IN (SELECT posted_by FROM items WHERE id = item_id)
  );

CREATE POLICY "Authenticated users can create claims"
  ON claims FOR INSERT WITH CHECK (
    auth.role() = 'authenticated'
    AND auth.uid() = claimant_id
    AND auth.uid() NOT IN (SELECT posted_by FROM items WHERE id = item_id)
  );

CREATE POLICY "Item owners can update claim status"
  ON claims FOR UPDATE USING (
    auth.uid() IN (SELECT posted_by FROM items WHERE id = item_id)
  );

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

-- ============================================================
-- Storage bucket for item images
-- Run these in Supabase Storage settings or SQL editor
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('item-images', 'item-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view item images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'item-images');

CREATE POLICY "Authenticated users can upload item images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'item-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own item images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'item-images' AND auth.uid()::text = (storage.foldername(name))[1]);
