import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { certificateSchema } from '@/lib/validations/certificate'
import { generateCertificateNumber, insertCertificate } from '@/lib/db'
import { generatePdfFromCertificateData } from '@/lib/pdf/generatePdf'
import { getServiceSupabase } from '@/lib/supabaseClient'
import { format } from 'date-fns'

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validatedData = certificateSchema.parse(body)

    // Get session (optional - form is public but we associate with user if logged in)
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // Generate unique certificate number
    const certificateNumber = await generateCertificateNumber()

    // Convert testDate string to Date object
    const testDate = new Date(validatedData.testDate)
    const issuedAt = new Date()

    // Generate PDF directly from certificate data
    const pdfBuffer = await generatePdfFromCertificateData({
      certificateNumber,
      petName: validatedData.petName,
      species: validatedData.species,
      breed: validatedData.breed,
      age: validatedData.age,
      sex: validatedData.sex,
      testType: validatedData.testType,
      testBrand: validatedData.testBrand,
      testDate,
      result: validatedData.result,
      vetName: validatedData.vetName,
      clinicName: validatedData.clinicName,
      district: validatedData.district,
      issuedAt,
    })

    // Upload to Supabase Storage
    const supabase = getServiceSupabase()

    // Create path: certificates/YYYY/MM/DD/{certificateNumber}.pdf
    const year = format(issuedAt, 'yyyy')
    const month = format(issuedAt, 'MM')
    const day = format(issuedAt, 'dd')
    const pdfPath = `certificates/${year}/${month}/${day}/${certificateNumber}.pdf`

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

    // Insert certificate record into database
    const certificate = await insertCertificate(
      {
        petName: validatedData.petName,
        species: validatedData.species,
        breed: validatedData.breed,
        age: validatedData.age,
        sex: validatedData.sex,
        testType: validatedData.testType,
        testBrand: validatedData.testBrand,
        testDate,
        result: validatedData.result,
        vetName: validatedData.vetName,
        clinicName: validatedData.clinicName,
        district: validatedData.district,
        createdBy: userId,
      },
      certificateNumber,
      pdfUrl,
      pdfPath
    )

    // Return success response
    return NextResponse.json({
      success: true,
      certificateNumber: certificate.certificateNumber,
      downloadUrl: certificate.pdfUrl,
    })
  } catch (error) {
    console.error('Error generating certificate:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, message: 'Error desconocido al generar el certificado' },
      { status: 500 }
    )
  }
}
