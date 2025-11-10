interface Contact {
  name: string
  email: string
  phone: string
  district: string
  notes?: string
}

interface Certificate {
  certificate_number: string
  pet_name: string
  species: string
  breed: string
  age: string
  sex: string
  test_type: string
  test_brand: string
  test_date: string
  result: string
  vet_name: string
  clinic_name: string
  district: string
  created_at: string
}

/**
 * Converts an array of contacts to CSV format and triggers download
 */
export function exportContactsToCSV(contacts: Contact[], filename = 'contacts.csv') {
  // Define CSV headers
  const headers = ['Nombre', 'Email', 'Teléfono', 'Distrito', 'Notas']

  // Convert contacts to CSV rows
  const rows = contacts.map((contact) => [
    contact.name,
    contact.email || '',
    contact.phone || '',
    contact.district || '',
    contact.notes || '',
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Converts an array of certificates to CSV format and triggers download
 */
export function exportCertificatesToCSV(
  certificates: Certificate[],
  filename = 'certificados.csv'
) {
  // Define CSV headers
  const headers = [
    'N° Certificado',
    'Nombre Mascota',
    'Especie',
    'Raza',
    'Edad',
    'Sexo',
    'Tipo de Prueba',
    'Marca del Test',
    'Fecha de Prueba',
    'Resultado',
    'Veterinario',
    'Clínica',
    'Distrito',
    'Fecha de Creación',
  ]

  // Convert certificates to CSV rows
  const rows = certificates.map((cert) => [
    cert.certificate_number,
    cert.pet_name || '',
    cert.species || '',
    cert.breed || '',
    cert.age || '',
    cert.sex || '',
    cert.test_type || '',
    cert.test_brand || '',
    cert.test_date || '',
    cert.result || '',
    cert.vet_name || '',
    cert.clinic_name || '',
    cert.district || '',
    cert.created_at || '',
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
