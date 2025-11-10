import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getServiceSupabase } from '@/lib/supabaseClient'

/**
 * GET /api/certificates/signed-url?path=...
 * Generates a signed URL for a PDF file in Supabase Storage
 * Requires authentication
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get PDF path from query parameters
    const searchParams = request.nextUrl.searchParams
    let pdfPath = searchParams.get('path')

    if (!pdfPath) {
      return NextResponse.json(
        { error: 'PDF path is required' },
        { status: 400 }
      )
    }

    // Generate signed URL (valid for 1 hour)
    const supabase = getServiceSupabase()
    const { data, error } = await supabase.storage
      .from('certificates')
      .createSignedUrl(pdfPath, 3600) // 1 hour expiration

    if (error) {
      console.error('Error creating signed URL:', error)
      return NextResponse.json(
        { error: 'Failed to create signed URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      signedUrl: data.signedUrl,
    })
  } catch (error) {
    console.error('Error generating signed URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

