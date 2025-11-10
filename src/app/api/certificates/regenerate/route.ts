import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { generateCertificateNumber, insertCertificate } from '@/lib/db'
import { generatePdfFromCertificateData } from '@/lib/pdf/generatePdf'
import { getServiceSupabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    // Get certificate ID from request body
    const body = await request.json()
    const { certificateId } = body

    if (!certificateId) {
      return NextResponse.json(
        { success: false, message: 'ID de certificado requerido' },
        { status: 400 }
      )
    }

    // Get certificate data from database
    const supabase = getServiceSupabase()
    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', certificateId)
      .single()

    if (fetchError || !certificate) {
      return NextResponse.json(
        { success: false, message: 'Certificado no encontrado' },
        { status: 404 }
      )
    }

    // Generate new certificate number
    const newCertificateNumber = await generateCertificateNumber()

    // Convert dates
    const testDate = new Date(certificate.test_date)
    const issuedAt = new Date()

    // Generate PDF directly from certificate data
    const pdfBuffer = await generatePdfFromCertificateData({
      certificateNumber: newCertificateNumber,
      petName: certificate.pet_name,
      species: certificate.species,
      breed: certificate.breed || '',
      age: certificate.age || '',
      sex: certificate.sex,
      testType: certificate.test_type,
      testBrand: certificate.test_brand || '',
      testDate,
      result: certificate.result,
      vetName: certificate.vet_name,
      clinicName: certificate.clinic_name,
      district: certificate.district || '',
      issuedAt,
    })

    // Upload to Supabase Storage
    const year = format(issuedAt, 'yyyy')
    const month = format(issuedAt, 'MM')
    const day = format(issuedAt, 'dd')
    const pdfPath = `certificates/${year}/${month}/${day}/${newCertificateNumber}.pdf`

    const { error: uploadError } = await supabase.storage
      .from('certificates')
      .upload(pdfPath, pdfBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
      })

    if (uploadError) {
      console.error('Error uploading PDF:', uploadError)
      throw new Error('Failed to upload PDF to storage')
    }

    // Generate signed URL (valid for 1 hour)
    const { data: urlData, error: urlError } = await supabase.storage
      .from('certificates')
      .createSignedUrl(pdfPath, 3600) // 1 hour expiration

    if (urlError) {
      console.error('Error creating signed URL:', urlError)
      throw new Error('Failed to create signed URL')
    }

    const pdfUrl = urlData.signedUrl

    // Insert new certificate record into database
    const newCertificate = await insertCertificate(
      {
        petName: certificate.pet_name,
        species: certificate.species,
        breed: certificate.breed || '',
        age: certificate.age || '',
        sex: certificate.sex,
        testType: certificate.test_type,
        testBrand: certificate.test_brand || '',
        testDate,
        result: certificate.result,
        vetName: certificate.vet_name,
        clinicName: certificate.clinic_name,
        district: certificate.district || '',
        createdBy: session.user?.id,
      },
      newCertificateNumber,
      pdfUrl,
      pdfPath
    )

    // Return success response
    return NextResponse.json({
      success: true,
      certificateNumber: newCertificate.certificateNumber,
      downloadUrl: newCertificate.pdfUrl,
    })
  } catch (error) {
    console.error('Error regenerating certificate:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error desconocido al regenerar el certificado' },
      { status: 500 }
    )
  }
}

