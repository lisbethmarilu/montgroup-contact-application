import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CertificateTemplateData } from './renderCertificateHTML'

/**
 * Generates a PDF buffer from certificate data using jsPDF
 * Works in serverless environments (Vercel, AWS Lambda, etc.)
 */
export async function generatePdfFromCertificateData(
  data: CertificateTemplateData
): Promise<Buffer> {
  try {
    // Create new PDF document in A4 format
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()

    // Colors (RGB values) - Using #4269B0 primary and #C74026 secondary
    const primaryColor = { r: 66, g: 105, b: 176 } // #4269B0
    const secondaryColor = { r: 199, g: 64, b: 38 } // #C74026
    const lightBlue = { r: 232, g: 236, b: 244 } // #e8ecf4 (light tint of primary)
    const lightSecondary = { r: 253, g: 232, b: 228 } // Light tint of secondary
    const textColor = { r: 0, g: 0, b: 0 } // Black
    const grayText = { r: 100, g: 100, b: 100 } // Gray

    // Header with blue background (40mm height)
    doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b)
    doc.rect(0, 0, pageWidth, 40, 'F')

    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE DESCARTE', pageWidth / 2, 20, {
      align: 'center',
    })

    // Subtitle
    doc.setFontSize(12)
    doc.setFont('helvetica', 'normal')
    doc.text('Prueba Diagnóstica Veterinaria', pageWidth / 2, 30, {
      align: 'center',
    })

    // Certificate number - using primary color for emphasis
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text(`N° Certificado: ${data.certificateNumber}`, 20, 55)

    let yPos = 70

    // Section: Datos del Paciente
    doc.setFillColor(lightBlue.r, lightBlue.g, lightBlue.b)
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('DATOS DEL PACIENTE', 20, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    const patientData = [
      ['Nombre de la mascota:', data.petName],
      ['Especie:', data.species],
      ['Raza:', data.breed],
      ['Edad:', data.age],
      ['Sexo:', data.sex],
    ]

    patientData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value || '-', 70, yPos)
      yPos += 7
    })

    yPos += 5

    // Section: Datos de la Prueba
    doc.setFillColor(lightBlue.r, lightBlue.g, lightBlue.b)
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('DATOS DE LA PRUEBA', 20, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    const testData = [
      ['Tipo de prueba:', data.testType],
      ['Marca de la prueba:', data.testBrand],
      [
        'Fecha de realización:',
        format(data.testDate, "dd 'de' MMMM 'de' yyyy", { locale: es }),
      ],
    ]

    testData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value || '-', 70, yPos)
      yPos += 7
    })

    yPos += 5

    // Resultado destacado
    const isNegative = data.result.toUpperCase() === 'NEGATIVO'
    const resultColor = isNegative
      ? { r: 220, g: 252, b: 231 } // Green for negative
      : lightSecondary // Light tint of secondary color for positive
    const resultTextColor = isNegative
      ? { r: 22, g: 163, b: 74 } // Dark green
      : secondaryColor // Secondary color for positive results

    doc.setFillColor(resultColor.r, resultColor.g, resultColor.b)
    doc.rect(15, yPos, pageWidth - 30, 15, 'F')

    doc.setDrawColor(resultTextColor.r, resultTextColor.g, resultTextColor.b)
    doc.setLineWidth(1)
    doc.rect(15, yPos, pageWidth - 30, 15, 'S')

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(resultTextColor.r, resultTextColor.g, resultTextColor.b)
    doc.text('RESULTADO:', 20, yPos + 8)
    doc.setFontSize(16)
    doc.text(data.result.toUpperCase(), 70, yPos + 8)

    yPos += 30

    // Section: Veterinaria Responsable
    doc.setFillColor(lightBlue.r, lightBlue.g, lightBlue.b)
    doc.rect(15, yPos - 5, pageWidth - 30, 8, 'F')
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('VETERINARIA RESPONSABLE', 20, yPos)

    yPos += 10
    doc.setFontSize(10)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    const clinicData = [
      ['Veterinario(a):', data.vetName],
      ['Clínica:', data.clinicName],
      ['Distrito:', data.district],
    ]

    clinicData.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(label, 20, yPos)
      doc.setFont('helvetica', 'normal')
      doc.text(value || '-', 70, yPos)
      yPos += 7
    })

    yPos += 15

    // Sección de firmas
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    const signatureY = yPos + 20
    doc.line(20, signatureY, 90, signatureY)
    doc.text('Firma del Veterinario', 35, signatureY + 5)

    doc.line(120, signatureY, 190, signatureY)
    doc.text('Sello de la Clínica', 140, signatureY + 5)

    // Footer
    yPos = 270
    doc.setFontSize(8)
    doc.setTextColor(grayText.r, grayText.g, grayText.b)
    doc.text(
      `Fecha de emisión: ${format(data.issuedAt, 'dd/MM/yyyy HH:mm', { locale: es })}`,
      pageWidth / 2,
      yPos,
      { align: 'center' }
    )
    doc.text(
      'Emitido como parte del programa de monitoreo veterinario',
      pageWidth / 2,
      yPos + 5,
      { align: 'center' }
    )

    // Disclaimer
    doc.setFontSize(7)
    doc.setFont('helvetica', 'italic')
    doc.text(
      'Este certificado es válido únicamente para la fecha de realización de la prueba indicada',
      pageWidth / 2,
      yPos + 12,
      { align: 'center' }
    )

    // Generate PDF buffer
    const pdfOutput = doc.output('arraybuffer')
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}
