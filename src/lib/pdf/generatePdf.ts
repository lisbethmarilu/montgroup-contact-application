import jsPDF from 'jspdf'
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
    const pageHeight = doc.internal.pageSize.getHeight()
    const margin = 3 // 3mm margin on all sides
    const contentWidth = pageWidth - 2 * margin
    const contentHeight = pageHeight - 2 * margin

    // Helper function to convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : { r: 0, g: 0, b: 0 }
    }

    // Colors (RGB values)
    const primaryColor = hexToRgb('#4c6ef5')
    const lightGray = hexToRgb('#f8f9fa')
    const sectionGray = hexToRgb('#e9ecef')
    const textColor = hexToRgb('#212529')
    const labelColor = hexToRgb('#6c757d')
    const sectionTextColor = hexToRgb('#495057')

    // Helper function to format dates
    const formatDate = (date: Date, format: string) => {
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')

      if (format === 'full') {
        const months = [
          'enero',
          'febrero',
          'marzo',
          'abril',
          'mayo',
          'junio',
          'julio',
          'agosto',
          'septiembre',
          'octubre',
          'noviembre',
          'diciembre',
        ]
        return `${day} de ${months[date.getMonth()]} de ${year}`
      }
      return `${day}/${month}/${year} a las ${hours}:${minutes}`
    }

    let yPosition = margin

    // Header with blue background
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.rect(0, 0, pageWidth, 30, 'F')

    // Header text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('CERTIFICADO DE DESCARTE', pageWidth / 2, 15, {
      align: 'center',
    })

    doc.setFontSize(14)
    doc.setFont('helvetica', 'normal')
    doc.text('Prueba Diagnóstica Veterinaria', pageWidth / 2, 22, {
      align: 'center',
    })

    yPosition = 35

    // Certificate number section
    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
    doc.rect(0, yPosition, pageWidth, 10, 'F')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(`N° Certificado: ${data.certificateNumber}`, pageWidth / 2, yPosition + 7, {
      align: 'center',
    })

    yPosition = 50

    // Content area
    const contentStartY = yPosition
    let currentY = contentStartY

    // Section: Datos del Paciente
    doc.setFillColor(sectionGray.r, sectionGray.g, sectionGray.b)
    doc.rect(margin, currentY, contentWidth, 8, 'F')
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.rect(margin, currentY, 4, 8, 'F')

    doc.setTextColor(sectionTextColor.r, sectionTextColor.g, sectionTextColor.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DEL PACIENTE', margin + 6, currentY + 5.5)

    currentY += 12

    // Patient data fields
    const patientFields = [
      { label: 'Nombre del Paciente', value: data.petName },
      { label: 'Especie', value: data.species },
      { label: 'Raza', value: data.breed },
      { label: 'Edad', value: data.age },
      { label: 'Sexo', value: data.sex },
    ]

    const fieldWidth = contentWidth / 2
    let fieldX = margin
    let fieldY = currentY

    patientFields.forEach((field, index) => {
      if (index > 0 && index % 2 === 0) {
        fieldX = margin
        fieldY += 10
      } else if (index > 0) {
        fieldX = margin + fieldWidth
      }

      doc.setTextColor(labelColor.r, labelColor.g, labelColor.b)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(field.label.toUpperCase(), fieldX, fieldY)

      doc.setTextColor(textColor.r, textColor.g, textColor.b)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'normal')
      doc.text(field.value || '-', fieldX, fieldY + 5)
    })

    currentY = fieldY + 10

    // Section: Datos de la Prueba
    currentY += 8
    doc.setFillColor(sectionGray.r, sectionGray.g, sectionGray.b)
    doc.rect(margin, currentY, contentWidth, 8, 'F')
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.rect(margin, currentY, 4, 8, 'F')

    doc.setTextColor(sectionTextColor.r, sectionTextColor.g, sectionTextColor.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('DATOS DE LA PRUEBA', margin + 6, currentY + 5.5)

    currentY += 12

    // Test data fields
    const testFields = [
      { label: 'Tipo de Prueba', value: data.testType },
      { label: 'Marca del Test', value: data.testBrand },
      { label: 'Fecha de la Prueba', value: formatDate(data.testDate, 'full') },
    ]

    fieldX = margin
    fieldY = currentY

    testFields.forEach((field, index) => {
      if (index > 0 && index % 2 === 0) {
        fieldX = margin
        fieldY += 10
      } else if (index > 0) {
        fieldX = margin + fieldWidth
      }

      doc.setTextColor(labelColor.r, labelColor.g, labelColor.b)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(field.label.toUpperCase(), fieldX, fieldY)

      doc.setTextColor(textColor.r, textColor.g, textColor.b)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'normal')
      doc.text(field.value || '-', fieldX, fieldY + 5)
    })

    currentY = fieldY + 15

    // Result box
    const resultColor =
      data.result === 'NEGATIVO'
        ? { r: 212, g: 237, b: 218 }
        : data.result === 'POSITIVO'
        ? { r: 248, g: 215, b: 218 }
        : { r: 255, g: 243, b: 205 }

    const resultTextColor =
      data.result === 'NEGATIVO'
        ? { r: 21, g: 87, b: 36 }
        : data.result === 'POSITIVO'
        ? { r: 114, g: 28, b: 36 }
        : { r: 133, g: 100, b: 4 }

    const resultBoxHeight = 25
    const resultBoxY = currentY

    doc.setFillColor(resultColor.r, resultColor.g, resultColor.b)
    doc.setDrawColor(resultTextColor.r, resultTextColor.g, resultTextColor.b)
    doc.setLineWidth(1)
    doc.roundedRect(
      margin,
      resultBoxY,
      contentWidth,
      resultBoxHeight,
      3,
      3,
      'FD'
    )

    doc.setTextColor(resultTextColor.r, resultTextColor.g, resultTextColor.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('RESULTADO', pageWidth / 2, resultBoxY + 8, {
      align: 'center',
    })

    doc.setFontSize(28)
    doc.setFont('helvetica', 'bold')
    doc.text(data.result, pageWidth / 2, resultBoxY + 18, {
      align: 'center',
    })

    currentY = resultBoxY + resultBoxHeight + 15

    // Section: Veterinaria Responsable
    doc.setFillColor(sectionGray.r, sectionGray.g, sectionGray.b)
    doc.rect(margin, currentY, contentWidth, 8, 'F')
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.rect(margin, currentY, 4, 8, 'F')

    doc.setTextColor(sectionTextColor.r, sectionTextColor.g, sectionTextColor.b)
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.text('VETERINARIA RESPONSABLE', margin + 6, currentY + 5.5)

    currentY += 12

    // Vet data fields
    const vetFields = [
      { label: 'Veterinario', value: data.vetName },
      { label: 'Clínica', value: data.clinicName },
      { label: 'Distrito', value: data.district },
    ]

    fieldX = margin
    fieldY = currentY

    vetFields.forEach((field, index) => {
      if (index > 0 && index % 2 === 0) {
        fieldX = margin
        fieldY += 10
      } else if (index > 0) {
        fieldX = margin + fieldWidth
      }

      doc.setTextColor(labelColor.r, labelColor.g, labelColor.b)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text(field.label.toUpperCase(), fieldX, fieldY)

      doc.setTextColor(textColor.r, textColor.g, textColor.b)
      doc.setFontSize(13)
      doc.setFont('helvetica', 'normal')
      doc.text(field.value || '-', fieldX, fieldY + 5)
    })

    // Footer at the bottom
    const footerY = pageHeight - 50
    doc.setFillColor(lightGray.r, lightGray.g, lightGray.b)
    doc.rect(0, footerY, pageWidth, pageHeight - footerY, 'F')

    // Footer info
    doc.setTextColor(labelColor.r, labelColor.g, labelColor.b)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    const footerText = `Fecha y hora de emisión: ${formatDate(data.issuedAt, 'datetime')}\nValidez: Este certificado es válido únicamente para la fecha y prueba especificadas. No constituye un diagnóstico médico definitivo y debe ser interpretado por un veterinario profesional.`

    const splitFooter = doc.splitTextToSize(footerText, contentWidth)
    doc.text(splitFooter, margin, footerY + 8)

    // Signature lines
    const signatureY = pageHeight - 20
    const signatureWidth = (contentWidth - 20) / 2

    doc.setDrawColor(0, 0, 0)
    doc.setLineWidth(0.5)
    doc.line(margin, signatureY, margin + signatureWidth, signatureY)
    doc.line(margin + signatureWidth + 20, signatureY, margin + contentWidth, signatureY)

    doc.setTextColor(sectionTextColor.r, sectionTextColor.g, sectionTextColor.b)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Firma del Veterinario', margin + signatureWidth / 2, signatureY + 5, {
      align: 'center',
    })
    doc.text('Sello de la Clínica', margin + signatureWidth + 20 + signatureWidth / 2, signatureY + 5, {
      align: 'center',
    })

    // Generate PDF buffer
    const pdfOutput = doc.output('arraybuffer')
    return Buffer.from(pdfOutput)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}
