-- ============================================================
-- MOTO-TRACK: Supabase Database Schema
-- Jalankan SQL ini di Supabase SQL Editor (supabase.com > project > SQL Editor)
-- ============================================================

-- 1. Tabel: users (Data Akun Pengguna & Admin)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabel: vehicles (Data Motor per User)
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT DEFAULT 'usr_admin_default',
  name TEXT NOT NULL,
  year INTEGER NOT NULL,
  plate TEXT DEFAULT '',
  current_odometer INTEGER DEFAULT 0,
  preset_type TEXT DEFAULT 'standard_matic',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel: parts (Sparepart yang Dilacak)
CREATE TABLE IF NOT EXISTS parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  interval_km INTEGER NOT NULL,
  last_replaced_km INTEGER DEFAULT 0,
  icon TEXT DEFAULT 'wrench',
  image_url TEXT DEFAULT NULL,
  est_price INTEGER DEFAULT 0,
  description TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel: service_logs (Riwayat Servis & Pengeluaran)
CREATE TABLE IF NOT EXISTS service_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  part_id UUID REFERENCES parts(id) ON DELETE SET NULL,
  part_name TEXT DEFAULT '',
  part_category TEXT DEFAULT '',
  service_date DATE NOT NULL,
  odometer INTEGER NOT NULL DEFAULT 0,
  odometer_km INTEGER DEFAULT 0,
  part_brand TEXT DEFAULT '',
  shop_name TEXT DEFAULT '',
  part_price INTEGER DEFAULT 0,
  labor_fee INTEGER DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Auto-migration untuk tabel yang sudah ada sebelumnya (jika ada kolom baru)
DO $$
BEGIN
  -- Kolom user_id di vehicles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='user_id') THEN
    ALTER TABLE vehicles ADD COLUMN user_id TEXT DEFAULT 'usr_admin_default';
  END IF;

  -- Kolom updated_at di vehicles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='vehicles' AND column_name='updated_at') THEN
    ALTER TABLE vehicles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Kolom image_url di parts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts' AND column_name='image_url') THEN
    ALTER TABLE parts ADD COLUMN image_url TEXT DEFAULT NULL;
  END IF;

  -- Kolom updated_at di parts
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='parts' AND column_name='updated_at') THEN
    ALTER TABLE parts ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  -- Kolom part_category di service_logs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_logs' AND column_name='part_category') THEN
    ALTER TABLE service_logs ADD COLUMN part_category TEXT DEFAULT '';
  END IF;

  -- Kolom odometer di service_logs
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='service_logs' AND column_name='odometer') THEN
    ALTER TABLE service_logs ADD COLUMN odometer INTEGER DEFAULT 0;
  END IF;
END $$;

-- 6. Index untuk performa query cepat
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_parts_vehicle_id ON parts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_vehicle_id ON service_logs(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_service_logs_service_date ON service_logs(service_date DESC);

-- 7. Grant akses penuh ke role anon dan authenticated (PostgREST API)
GRANT ALL ON TABLE users TO anon, authenticated;
GRANT ALL ON TABLE vehicles TO anon, authenticated;
GRANT ALL ON TABLE parts TO anon, authenticated;
GRANT ALL ON TABLE service_logs TO anon, authenticated;

-- 8. Enable RLS lalu buat policy open-access untuk SELECT, INSERT, UPDATE, DELETE
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_logs ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika sudah ada agar tidak error saat script dijalankan berulang
DROP POLICY IF EXISTS "Allow full access to users" ON users;
DROP POLICY IF EXISTS "Allow full access to vehicles" ON vehicles;
DROP POLICY IF EXISTS "Allow full access to parts" ON parts;
DROP POLICY IF EXISTS "Allow full access to service_logs" ON service_logs;

CREATE POLICY "Allow full access to users" ON users FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to vehicles" ON vehicles FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to parts" ON parts FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to service_logs" ON service_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

