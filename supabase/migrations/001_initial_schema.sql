-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Certificate counters table (for daily sequence)
CREATE TABLE IF NOT EXISTS cert_counters (
  date_key DATE PRIMARY KEY,
  seq INTEGER DEFAULT 0
);

-- Function to increment certificate counter atomically
CREATE OR REPLACE FUNCTION increment_cert_counter(p_date_key DATE)
RETURNS INTEGER AS $$
DECLARE
  new_seq INTEGER;
BEGIN
  -- Insert or update counter for the given date
  INSERT INTO cert_counters (date_key, seq)
  VALUES (p_date_key, 1)
  ON CONFLICT (date_key)
  DO UPDATE SET seq = cert_counters.seq + 1
  RETURNING seq INTO new_seq;

  RETURN new_seq;
END;
$$ LANGUAGE plpgsql;

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  certificate_number TEXT UNIQUE NOT NULL,
  pdf_url TEXT NOT NULL,
  pdf_path TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  age TEXT,
  sex TEXT NOT NULL,
  test_type TEXT NOT NULL,
  test_brand TEXT,
  test_date DATE NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('NEGATIVO', 'POSITIVO', 'INDETERMINADO')),
  vet_name TEXT NOT NULL,
  clinic_name TEXT NOT NULL,
  district TEXT,
  created_by UUID, -- Will be updated to reference next_auth.users in migration 002
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for certificates
CREATE INDEX IF NOT EXISTS idx_certificates_created_at ON certificates(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_pet_name ON certificates(pet_name);
CREATE INDEX IF NOT EXISTS idx_certificates_created_by ON certificates(created_by);
CREATE INDEX IF NOT EXISTS idx_certificates_result ON certificates(result);
CREATE INDEX IF NOT EXISTS idx_certificates_species ON certificates(species);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  district TEXT,
  notes TEXT,
  owner_id UUID NOT NULL, -- Will be updated to reference next_auth.users in migration 002
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for contacts
CREATE INDEX IF NOT EXISTS idx_contacts_owner_id ON contacts(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON contacts(name);

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for certificates
-- Allow anyone to insert (public form)
CREATE POLICY "Anyone can create certificates"
  ON certificates FOR INSERT
  WITH CHECK (true);

-- Allow users to view their own certificates
CREATE POLICY "Users can view own certificates"
  ON certificates FOR SELECT
  USING (created_by IS NULL OR auth.uid() = created_by);

-- RLS Policies for contacts
-- Users can only manage their own contacts
CREATE POLICY "Users can view own contacts"
  ON contacts FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own contacts"
  ON contacts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own contacts"
  ON contacts FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own contacts"
  ON contacts FOR DELETE
  USING (auth.uid() = owner_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
