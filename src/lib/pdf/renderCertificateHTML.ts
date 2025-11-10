import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface CertificateTemplateData {
  certificateNumber: string
  petName: string
  species: string
  breed: string
  age: string
  sex: string
  testType: string
  testBrand: string
  testDate: Date
  result: 'NEGATIVO' | 'POSITIVO' | 'INDETERMINADO'
  vetName: string
  clinicName: string
  district: string
  issuedAt: Date
}

/*
export function renderCertificateHTML(data: CertificateTemplateData): string {
  const testDateFormatted = format(data.testDate, "dd 'de' MMMM 'de' yyyy", {
    locale: es,
  })
  const issuedDateFormatted = format(
    data.issuedAt,
    "dd/MM/yyyy 'a las' HH:mm",
    {
      locale: es,
    }
  )

  const resultColor =
    data.result === 'NEGATIVO'
      ? '#d4edda'
      : data.result === 'POSITIVO'
      ? '#f8d7da'
      : '#fff3cd'
  const resultTextColor =
    data.result === 'NEGATIVO'
      ? '#155724'
      : data.result === 'POSITIVO'
      ? '#721c24'
      : '#856404'

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Certificado Veterinario - ${data.certificateNumber}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
    }

    body {
      font-family: 'Inter', 'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      line-height: 1.4;
      color: #333;
      background: white;
      font-size: 12px;
      display: flex;
      flex-direction: column;
    }

    .container {
      width: 100%;
      height: 100vh;
      min-height: 100vh;
      margin: 0;
      border: 2px solid #4c6ef5;
      border-radius: 0;
      overflow: hidden;
      page-break-inside: avoid;
      display: flex;
      flex-direction: column;
    }

    .header {
      background: #4c6ef5;
      color: white;
      padding: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .header h1 {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 6px;
      letter-spacing: 0.5px;
    }

    .header p {
      font-size: 16px;
      opacity: 0.95;
    }

    .cert-number {
      background: #f8f9fa;
      padding: 12px 20px;
      text-align: center;
      font-size: 16px;
      font-weight: 600;
      color: #4c6ef5;
      border-bottom: 1px solid #dee2e6;
      flex-shrink: 0;
    }

    .content {
      padding: 24px 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 0;
    }

    .sections-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
    }

    .section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .section-title {
      background: #e9ecef;
      padding: 10px 14px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #495057;
      margin-bottom: 14px;
      border-left: 4px solid #4c6ef5;
    }

    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 14px;
    }

    .field {
      margin-bottom: 12px;
    }

    .field-label {
      font-size: 11px;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      margin-bottom: 4px;
    }

    .field-value {
      font-size: 15px;
      color: #212529;
      font-weight: 500;
    }

    .result-box {
      background: ${resultColor};
      border: 2px solid ${resultTextColor};
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
    }

    .result-label {
      font-size: 13px;
      font-weight: 600;
      color: ${resultTextColor};
      margin-bottom: 8px;
      text-transform: uppercase;
    }

    .result-value {
      font-size: 32px;
      font-weight: 700;
      color: ${resultTextColor};
      letter-spacing: 0.5px;
    }

    .footer {
      background: #f8f9fa;
      padding: 18px 20px;
      border-top: 1px solid #dee2e6;
      page-break-inside: avoid;
      flex-shrink: 0;
      margin-top: auto;
    }

    .footer-info {
      font-size: 11px;
      color: #6c757d;
      margin-bottom: 14px;
      line-height: 1.5;
    }

    .signature-section {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 30px;
      margin-top: 14px;
    }

    .signature-line {
      border-top: 2px solid #333;
      padding-top: 8px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #495057;
    }

    @media print {
      body {
        padding: 0;
      }
      .container {
        border: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>CERTIFICADO DE DESCARTE</h1>
      <p>Prueba Diagnóstica Veterinaria</p>
    </div>

    <div class="cert-number">
      N° Certificado: <strong>${data.certificateNumber}</strong>
    </div>

    <div class="content">
      <div class="sections-container">
        <!-- Datos del Paciente -->
        <div class="section">
          <div class="section-title">DATOS DEL PACIENTE</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Nombre del Paciente</div>
              <div class="field-value">${data.petName}</div>
            </div>
            <div class="field">
              <div class="field-label">Especie</div>
              <div class="field-value">${data.species}</div>
            </div>
            <div class="field">
              <div class="field-label">Raza</div>
              <div class="field-value">${data.breed}</div>
            </div>
            <div class="field">
              <div class="field-label">Edad</div>
              <div class="field-value">${data.age}</div>
            </div>
            <div class="field">
              <div class="field-label">Sexo</div>
              <div class="field-value">${data.sex}</div>
            </div>
          </div>
        </div>

        <!-- Datos de la Prueba -->
        <div class="section">
          <div class="section-title">DATOS DE LA PRUEBA</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Tipo de Prueba</div>
              <div class="field-value">${data.testType}</div>
            </div>
            <div class="field">
              <div class="field-label">Marca del Test</div>
              <div class="field-value">${data.testBrand}</div>
            </div>
            <div class="field">
              <div class="field-label">Fecha de la Prueba</div>
              <div class="field-value">${testDateFormatted}</div>
            </div>
          </div>

          <div class="result-box">
            <div class="result-label">Resultado</div>
            <div class="result-value">${data.result}</div>
          </div>
        </div>

        <!-- Veterinaria Responsable -->
        <div class="section">
          <div class="section-title">VETERINARIA RESPONSABLE</div>
          <div class="field-grid">
            <div class="field">
              <div class="field-label">Veterinario</div>
              <div class="field-value">${data.vetName}</div>
            </div>
            <div class="field">
              <div class="field-label">Clínica</div>
              <div class="field-value">${data.clinicName}</div>
            </div>
            <div class="field">
              <div class="field-label">Distrito</div>
              <div class="field-value">${data.district}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="footer">
        <div class="footer-info">
          <strong>Fecha y hora de emisión:</strong> ${issuedDateFormatted}<br>
          <strong>Validez:</strong> Este certificado es válido únicamente para la fecha y prueba especificadas.
          No constituye un diagnóstico médico definitivo y debe ser interpretado por un veterinario profesional.
        </div>

        <div class="signature-section">
          <div class="signature-line">
            Firma del Veterinario
          </div>
          <div class="signature-line">
            Sello de la Clínica
          </div>
        </div>
    </div>
  </div>
</body>
</html>
  `.trim()
}
*/
