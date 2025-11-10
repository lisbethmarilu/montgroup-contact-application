import { getServiceSupabase } from './supabaseClient'
import { v4 as uuidv4 } from 'uuid'
import { format } from 'date-fns'

export interface CertificateData {
  petName: string
  species: string
  breed: string
  age: string
  sex: string
  testType: string
  testBrand: string
  testDate: Date
  result: string
  vetName: string
  clinicName: string
  district: string
  createdBy?: string
}

export interface Certificate extends CertificateData {
  id: string
  certificateNumber: string
  pdfUrl: string
  pdfPath: string
  createdAt: Date
}

export interface Contact {
  id: string
  name: string
  email: string
  phone: string
  district: string
  notes?: string
  ownerId: string
  createdAt: Date
}

/**
 * Generates a unique certificate number with format CERT-YYYYMMDD-####
 * Uses atomic counter to ensure uniqueness per day
 */
export async function generateCertificateNumber(): Promise<string> {
  const supabase = getServiceSupabase()
  const today = format(new Date(), 'yyyy-MM-dd')
  const dateKey = format(new Date(), 'yyyyMMdd')

  // Atomic increment of daily counter
  const { data, error } = await supabase.rpc('increment_cert_counter', {
    p_date_key: today
  })

  if (error) {
    console.error('Error generating certificate number:', error)
    // Fallback to UUID-based number if counter fails
    return `CERT-${dateKey}-${uuidv4().slice(0, 4).toUpperCase()}`
  }

  const sequence = data || 1
  const paddedSeq = String(sequence).padStart(4, '0')
  return `CERT-${dateKey}-${paddedSeq}`
}

/**
 * Inserts a new certificate into the database
 */
export async function insertCertificate(
  certificateData: CertificateData,
  certificateNumber: string,
  pdfUrl: string,
  pdfPath: string
): Promise<Certificate> {
  const supabase = getServiceSupabase()

  const record = {
    id: uuidv4(),
    certificate_number: certificateNumber,
    pdf_url: pdfUrl,
    pdf_path: pdfPath,
    pet_name: certificateData.petName,
    species: certificateData.species,
    breed: certificateData.breed,
    age: certificateData.age,
    sex: certificateData.sex,
    test_type: certificateData.testType,
    test_brand: certificateData.testBrand,
    test_date: certificateData.testDate.toISOString().split('T')[0],
    result: certificateData.result,
    vet_name: certificateData.vetName,
    clinic_name: certificateData.clinicName,
    district: certificateData.district,
    created_by: certificateData.createdBy || null,
  }

  const { data, error } = await supabase
    .from('certificates')
    .insert(record)
    .select()
    .single()

  if (error) {
    throw new Error(`Error inserting certificate: ${error.message}`)
  }

  return {
    id: data.id,
    certificateNumber: data.certificate_number,
    pdfUrl: data.pdf_url,
    pdfPath: data.pdf_path,
    petName: data.pet_name,
    species: data.species,
    breed: data.breed,
    age: data.age,
    sex: data.sex,
    testType: data.test_type,
    testBrand: data.test_brand,
    testDate: new Date(data.test_date),
    result: data.result,
    vetName: data.vet_name,
    clinicName: data.clinic_name,
    district: data.district,
    createdBy: data.created_by,
    createdAt: new Date(data.created_at),
  }
}
