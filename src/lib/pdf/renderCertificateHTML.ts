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


